"""Live (interactive) simulation: run a transient analysis slice by slice.

Stage 3c-1 prototype - no user interface, no process protocol yet.  It shows that
a PyAMS circuit can be stepped in small slices of circuit time while

    * the value of a parameter is changed between two steps (an input widget:
      switch, button, slider ...), and
    * signals are read after every step (an output widget: LED, 7-segment, scope ...).

The solver is the one of ``circuit.run()`` (same Newton iteration, same ddt() history,
same ``accepting()`` rules); only the loop over the time points is replaced by this
class, so a live run gives the same numbers as a normal transient run of the same
step when no input changes.

Usage::

    from pyams.lib import circuit
    from pyams.live import LiveRunner

    cir = circuit()
    cir.addElements({'V1': V1, 'R1': R1, 'C1': C1})
    live = LiveRunner(cir, step=1e-6, outputs=['out', 'C1.V'])
    live.begin()                              # operating point at t = 0
    live.set_param('V1', 'Vdc', 5.0)          # an input changed
    samples = live.advance(1e-3)              # 1 ms of circuit time -> list of (t, {name: value})
    print(live.value('out'))                  # last value of a signal
    live.end()                                # always call it (gives the models back)

Real time::

    live.run_realtime(rate=0.01, on_slice=fn)  # 0.01 s of circuit time per real second
"""

import time as _wall

from pyams.lib import SimulationError, _active, model as _model, time as _simtime

import numpy as np

__all__ = ['LiveRunner']


class LiveRunner:
    """Steps a circuit with a fixed time step, slice after slice."""

    def __init__(self, cir, step, outputs=None, uic=False):
        if step is None or step <= 0:
            raise ValueError('step must be positive')
        self.cir = cir
        self.step = float(step)
        self.outputs = list(dict.fromkeys(outputs or []))
        self.uic = bool(uic)
        self.t = 0.0
        self.x = None
        self.started = False
        self._probes = []
        self._last = {}
        self._x = []
        self._pending = {}          # parameter changes applied at the next step
        self._hooked = []           # elements whose model defines live()
        self._digital = []          # elements with digital() (empty with older versions of pyams)
        self._reads = {}            # key -> (element, kind, name)  readings for output widgets

    # -- life cycle ----------------------------------------------------------
    def begin(self, t0=0.0):
        """Compile the circuit and solve the starting point (t0)."""
        cir = self.cir
        cir.mode = 'tran'
        cir.start, cir.stop, cir.step = float(t0), float(t0) + self.step, self.step
        cir.dc_sweep = None
        cir.par_sweep = None
        cir._compile()
        names = self.outputs or list(cir._node_index)
        self.outputs = list(names)
        self._probes = [cir._make_probe(n) for n in names]
        self._check_reads()
        self._hooked = [el for el in cir._elems if callable(getattr(type(el.model), 'live', None))]
        cir._dyn = []
        self._init_digital()
        cir._h = None
        cir._h1 = None
        cir._bdf2 = False
        _active['circuit'] = cir
        cir._freeze()
        self.started = True
        try:
            if self.uic:
                x = np.zeros(cir._size)
                _simtime.value = t0
                xl = x.tolist()
                for el in cir._elems:            # finds the elements that call ddt()
                    cir._eval(el, [cir._in_value(xl, s) for s in el.in_specs])
            else:
                x = cir._solve_op(np.zeros(cir._size), t0)
            if x is None:
                raise SimulationError('the operating point at t = %g s did not converge' % t0)
            if self._digital and not self.uic:
                x = cir._digital_settle(x, t0)       # initial state of the digital models
            self._sample(x, t0)
            cir._commit(x, t0)
        except BaseException:
            self.end()
            raise
        self.x, self.t = x, float(t0)
        return dict(self._last)

    def _init_digital(self):
        """Digital models (digital() / dsignal, e.g. Relay, gates, flip-flops): the same set-up as
        Circuit.run() does.  Older versions of pyams have no digital models: nothing to do."""
        cir = self.cir
        self._digital = []
        if not hasattr(cir, '_dig') or not hasattr(_model, 'digital'):
            return
        cir._dig = [el for el in cir._elems if type(el.model).digital is not _model.digital]
        cir._events = []
        cir._dead = set()
        cir._t_ev = None
        cir._dinit = False
        cir._immediate = []
        cir._dtol = 1e-3 * cir.options['event_step']
        for el in cir._dig:
            mdl = el.model
            mdl._bmem.clear(); mdl._bcur.clear(); mdl._bprev.clear(); mdl._pending.clear()
            for ds in mdl._dsigs.values():
                if ds.direction == 'out':
                    setattr(mdl, ds._attr, ds.init)
            mdl.digital_reset()
        self._digital = cir._dig

    def end(self):
        """Give the models back their own class and signals (always call it)."""
        if not self.started:
            return
        try:
            self.cir._unfreeze()
        finally:
            _active['circuit'] = None
            self.cir._h = None
            self.started = False

    # -- inputs ----------------------------------------------------------------
    def set_param(self, element, name, value):
        """Change a parameter; it is used from the next step on."""
        el = self.cir._by_name.get(element)
        if el is None:
            raise KeyError('unknown element %r (elements: %s)' % (element, ', '.join(self.cir._by_name)))
        if name not in el.model._params:
            raise KeyError('%s has no parameter %r (parameters: %s)' % (
                element, name, ', '.join(el.model._params)))
        self._pending[(element, name)] = float(value)

    def _apply_pending(self):
        for (element, name), v in self._pending.items():
            self.cir._by_name[element].d[name] = v          # plain float, like the DC sweep does
        self._pending.clear()

    # -- outputs -----------------------------------------------------------------
    def _sample(self, x, t):
        _simtime.value = t
        xl = x.tolist()
        cir = self.cir
        for el in self._hooked:               # optional def live(self) of a model: runs once per
            cir._eval(el, [cir._in_value(xl, s) for s in el.in_specs])   # accepted step and may
            try:                              # write output parameters (led, seg ...)
                el.model.live()
            except Exception as exc:
                raise SimulationError('live() of %s failed: %s: %s' % (
                    el.name if hasattr(el, 'name') else el.model.__class__.__name__,
                    type(exc).__name__, exc))
        self._last = {name: float(fn(xl)) for name, _, fn in self._probes}
        self._x = xl

    def watch(self, key, element, kind, name):
        """Register a reading for an output widget.  kind: 'param' (a value written by live()
        or a parameter), 'signal' (a signal of the element, e.g. V or I)."""
        self._reads[key] = (element, kind, name)

    def _check_reads(self):
        for key, (element, kind, name) in self._reads.items():
            el = self.cir._by_name.get(element)
            if el is None:
                raise KeyError('unknown element %r' % element)
            if kind == 'param' and name not in el.model._params:
                raise KeyError('%s has no parameter %r (parameters: %s)' % (
                    element, name, ', '.join(el.model._params)))
            if kind == 'signal' and name not in el.model._signals:
                raise KeyError('%s has no signal %r (signals: %s)' % (
                    element, name, ', '.join(el.model._signals)))

    def read(self, key):
        element, kind, name = self._reads[key]
        el = self.cir._by_name[element]
        if kind == 'signal':
            cir = self.cir
            cir._eval(el, [cir._in_value(self._x, s) for s in el.in_specs])
        return float(el.d[name])

    def read_all(self):
        return {k: self.read(k) for k in self._reads}

    def value(self, name):
        return self._last[name]

    def values(self):
        return dict(self._last)

    # -- stepping ---------------------------------------------------------------
    def advance(self, dt):
        """Advance the circuit by dt seconds (whole steps; the last one may be shorter).
        Returns the list of (t, {name: value}) of every step taken."""
        if not self.started:
            raise SimulationError('call begin() first')
        cir = self.cir
        target = self.t + float(dt)
        out = []
        while self.t < target - 1e-12 * self.step:
            self._apply_pending()
            t1 = min(self.t + self.step, target)
            if t1 - self.t < 1e-3 * self.step:           # rounding rest: join with the next slice
                break

            def rec(x, t):
                self._sample(x, t)
            step_fn = cir._advance_dig if self._digital else cir._advance
            self.x = step_fn(self.x, self.t, t1, rec)
            self.t = t1
            out.append((t1, dict(self._last)))
        return out

    def run_realtime(self, rate=1.0, on_slice=None, max_circuit_time=None,
                     slice_real=0.02, should_stop=None):
        """Run paced against the wall clock: ``rate`` seconds of circuit time per real
        second (0.01 = the circuit runs 100 times slower than reality).
        rate=None runs as fast as possible.

        Every ``slice_real`` seconds of real time ``on_slice(t, samples, info)`` is called
        (samples = the steps taken since the last call; info = {'speed': achieved circuit
        seconds per real second, 'late': True when the machine cannot follow the rate}).
        Stops when ``should_stop()`` is true or t reaches ``max_circuit_time``."""
        t_real0, t_circ0 = _wall.perf_counter(), self.t
        last_report = t_real0
        buf = []

        def report(now, final=False):
            nonlocal buf, last_report
            if on_slice is not None and (buf or not final):
                speed = (self.t - t_circ0) / max(1e-9, now - t_real0)
                late = (rate is not None and
                        self.t < t_circ0 + (now - t_real0) * rate - 5 * self.step)
                on_slice(self.t, buf, {'speed': speed, 'late': late})
            buf = []
            last_report = now

        while True:
            if should_stop is not None and should_stop():
                break
            if max_circuit_time is not None and self.t >= max_circuit_time - 1e-3 * self.step:
                break
            now = _wall.perf_counter()
            if rate is None:
                dt = self.step * 10                      # as fast as possible: small batches
            else:
                dt = t_circ0 + (now - t_real0) * rate - self.t      # where the circuit should be
            dt = min(dt, self.step * 50)                 # short batches: stop / input stay responsive
            if max_circuit_time is not None:
                dt = min(dt, max_circuit_time - self.t)
            if dt >= self.step * (1.0 - 1e-9) or (max_circuit_time is not None and dt > 0 and rate is None):
                buf.extend(self.advance(dt))
            else:
                _wall.sleep(min(slice_real / 4, max(0.0, (self.step - dt) / max(rate or 1.0, 1e-12))))
            now = _wall.perf_counter()
            if now - last_report >= slice_real:
                report(now)
        report(_wall.perf_counter(), final=True)
