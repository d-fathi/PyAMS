"""Live (interactive) simulation session: a long-running process talking JSON lines.

Usage:  python liveSession.py <extension_dir> <code_file> <config_json_file>

<code_file>   the PyAMS code of the circuit (the same code runAnalysis.py uses).
<config>      {"step": "100us",                 fixed circuit time step
               "rate": 1.0,                    circuit seconds per real second (null = as fast as possible)
               "stop": null,                   optional circuit time limit ("5s")
               "uic": false,
               "report": 0.04,                 real seconds between two updates sent to the page
               "outputs": ["in", "out"],       signals for the scope  (node names / "Element.signal")
               "widgets": {                    every widget by its full ref  <part>.<widget>
                   "X1.sw1": {"dir": "in",  "kind": "param",  "element": "X1", "name": "on",  "value": 1},
                   "X1.led": {"dir": "out", "kind": "param",  "element": "X1", "name": "led"},
                   "X1.v":   {"dir": "out", "kind": "signal", "element": "X1", "name": "V", "scale": 1, "offset": 0},
                   "X1.n":   {"dir": "out", "kind": "node",   "node": "out", "scale": 1, "offset": 0}}}
             kind "param"  : a parameter of the element (inputs write it, outputs read what live() wrote)
             kind "signal" : a signal of the element (outputs only)
             kind "node"   : the voltage of a node (outputs only; this is how a pin binding arrives)
             out value = scale * reading + offset  (param readings are used as they are)

Lines read from stdin (one JSON object each):
    {"cmd": "input", "ref": "X1.sw1", "value": 1}
    {"cmd": "pause"} {"cmd": "resume"} {"cmd": "reset"} {"cmd": "stop"}
    {"cmd": "rate", "value": 0.5}                circuit seconds per real second (null = fastest)

Lines written to stdout (one JSON object each):
    {"event": "log",     "message": "...", "level": "info|warn|error"}
    {"event": "ready",   "elements": [...], "outputs": [...]}                       once, after the start point
    {"event": "widgets", "t": 0.0123, "values": {"X1.led": 0, ...}}                 only values that changed
    {"event": "scope",   "t": [..], "series": {"in": [..], "out": [..]}}            new samples since the last one
    {"event": "status",  "t": 0.0123, "state": "running|paused", "speed": 0.99, "late": false}
    {"event": "error",   "message": "..."}                                          last line on failure
    {"event": "end",     "t": 0.5}                                                  last line otherwise
"""
import contextlib
import io
import json
import math
import queue
import sys
import threading
import traceback

_REAL_OUT = sys.stdout


def emit(**event):
    _REAL_OUT.write(json.dumps(event, ensure_ascii=False) + '\n')
    _REAL_OUT.flush()


def finite(v):
    v = float(v)
    return v if math.isfinite(v) else None


class Session:
    def __init__(self, ext_dir, code, config):
        self.code = code
        self.cfg = config
        self.cmds = queue.Queue()
        self.runner = None
        self.rate = config.get('rate', 1.0)
        self.state = 'running'
        self.sent = {}
        self.scope_t = []
        self.scope_y = {}
        self.exit_code = 0

    # -- build ---------------------------------------------------------------------------
    def build(self):
        from pyams.lib import circuit, model, _parse_value
        from pyams.live import LiveRunner
        namespace = {'__name__': '__main__'}
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            exec(compile(self.code, '<pyams code>', 'exec'), namespace)
        for text in out.getvalue().splitlines():
            emit(event='log', message=text, level='info')
        elements = {n: v for n, v in namespace.items() if isinstance(v, model) and not n.startswith('_')}
        if not elements:
            raise ValueError('The code creates no element (no model instance found).')
        self.elements = elements
        widgets = self.cfg.get('widgets') or {}
        # starting values of the inputs go into the model before the first solution
        for ref, w in widgets.items():
            if w.get('dir') == 'in' and 'value' in w and w.get('kind', 'param') == 'param':
                elements[w['element']].setParams({w['name']: float(w['value'])})
        cir = circuit()
        cir.addElements(elements)
        step = self.cfg.get('step', '100us')
        step = float(step) if isinstance(step, (int, float)) else _parse_value(str(step), 's')
        stop = self.cfg.get('stop')
        self.stop_time = None if stop in (None, '', 0) else (
            float(stop) if isinstance(stop, (int, float)) else _parse_value(str(stop), 's'))
        outputs = list(self.cfg.get('outputs') or [])
        nodes = [w['node'] for w in widgets.values() if w.get('kind') == 'node']
        self.runner = LiveRunner(cir, step, outputs + [n for n in nodes if n not in outputs],
                                 uic=bool(self.cfg.get('uic')))
        self.scope_names = outputs
        self.scale = {}
        for ref, w in widgets.items():
            if w.get('dir', 'out') != 'out':
                continue
            kind = w.get('kind', 'param')
            if kind in ('param', 'signal'):
                self.runner.watch(ref, w['element'], kind, w['name'])
            self.scale[ref] = (float(w.get('scale', 1.0)), float(w.get('offset', 0.0)))
        self.widgets = widgets

    def start_point(self):
        self.runner.begin(0.0)
        self.sent = {}
        self.scope_t, self.scope_y = [], {n: [] for n in self.scope_names}
        self.push_scope(0.0, self.runner.values())
        emit(event='ready', elements=list(self.elements), outputs=self.scope_names)
        self.push_widgets(0.0)

    # -- output ---------------------------------------------------------------------------
    def widget_values(self):
        vals = {}
        last = self.runner.values()
        for ref, w in self.widgets.items():
            if w.get('dir', 'out') != 'out':
                continue
            kind = w.get('kind', 'param')
            sc, off = self.scale[ref]
            if kind == 'param':
                vals[ref] = self.runner.read(ref)
            elif kind == 'signal':
                vals[ref] = sc * self.runner.read(ref) + off
            elif kind == 'node':
                vals[ref] = sc * last[w['node']] + off
        return vals

    def push_widgets(self, t):
        changed = {}
        for ref, v in self.widget_values().items():
            v = finite(v)
            if self.sent.get(ref, object()) != v:
                self.sent[ref] = v
                changed[ref] = v
        if changed:
            emit(event='widgets', t=t, values=changed)

    def push_scope(self, t, values):
        self.scope_t.append(t)
        for n in self.scope_names:
            self.scope_y[n].append(finite(values[n]))

    def flush_scope(self):
        if self.scope_t:
            emit(event='scope', t=self.scope_t, series=self.scope_y)
            self.scope_t, self.scope_y = [], {n: [] for n in self.scope_names}

    # -- control --------------------------------------------------------------------------
    def reader(self):
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                self.cmds.put(json.loads(line))
            except ValueError:
                emit(event='log', message='bad command: ' + line, level='warn')
        self.cmds.put({'cmd': 'stop'})                 # stdin closed: the page went away

    def handle(self, cmd):
        """Returns None to go on, or 'stop' / 'reset' / 'pause' / 'rate' for the main loop."""
        c = cmd.get('cmd')
        if c == 'input':
            w = self.widgets.get(cmd.get('ref'))
            if w is None or w.get('dir') != 'in':
                emit(event='log', message='unknown input widget %r' % cmd.get('ref'), level='warn')
            elif w.get('kind', 'param') != 'param':
                emit(event='log', message='input %s must be bound to a parameter' % cmd['ref'], level='warn')
            else:
                self.runner.set_param(w['element'], w['name'], float(cmd['value']))
            return None
        if c == 'rate':
            v = cmd.get('value')
            self.rate = None if v is None else float(v)
            return 'rate'
        if c in ('pause', 'reset', 'stop'):
            return c
        if c == 'resume':
            return 'resume'
        return None

    def should_stop(self):
        try:
            while True:
                r = self.handle(self.cmds.get_nowait())
                if r:
                    self.pending = r
                    return True
        except queue.Empty:
            return False

    def on_slice(self, t, samples, info):
        for st, vals in samples:
            self.push_scope(st, vals)
        self.flush_scope()
        self.push_widgets(t)
        emit(event='status', t=t, state=self.state, speed=finite(info['speed']), late=bool(info['late']))

    def run(self):
        self.build()
        self.start_point()
        threading.Thread(target=self.reader, daemon=True).start()
        self.pending = None
        report = float(self.cfg.get('report', 0.04))
        while True:
            if self.state == 'running':
                self.pending = None
                self.runner.run_realtime(rate=self.rate, on_slice=self.on_slice,
                                         max_circuit_time=self.stop_time, slice_real=report,
                                         should_stop=self.should_stop)
                r = self.pending
                if r is None:                           # time limit reached
                    break
            else:
                r = self.handle(self.cmds.get())        # paused: wait for a command
                if r is None:
                    continue
            if r == 'stop':
                break
            if r == 'pause':
                self.state = 'paused'
                emit(event='status', t=self.runner.t, state='paused', speed=0.0, late=False)
            elif r == 'resume':
                self.state = 'running'
            elif r == 'reset':
                self.runner.end()
                self.build()
                self.start_point()
                self.state = 'running'
        t = self.runner.t
        self.runner.end()
        emit(event='end', t=t)
        return 0


def main(argv):
    ext_dir, code_file, config_file = argv[1], argv[2], argv[3]
    sys.path.insert(0, ext_dir)
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(code_file)))    # project models (from X import X)
    with open(code_file, 'r', encoding='utf-8-sig') as f:
        code = f.read()
    with open(config_file, 'r', encoding='utf-8-sig') as f:
        config = json.load(f)
    sys.stdout = io.StringIO()                   # stray print() calls of the models must not break the protocol
    try:
        return Session(ext_dir, code, config).run()
    except BaseException as exc:
        tb = traceback.extract_tb(exc.__traceback__)
        line = next((fr.lineno for fr in reversed(tb) if fr.filename == '<pyams code>'), None)
        emit(event='error', message='%s: %s' % (type(exc).__name__, exc), line=line)
        return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
