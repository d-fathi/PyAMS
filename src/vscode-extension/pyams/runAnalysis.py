"""Run a PyAMS circuit analysis and stream the progress as JSON lines.

Usage:  python runAnalysis.py <extension_dir> <code_file> <analysis_json_file>

<code_file>  PyAMS code that creates the elements, e.g.
                 from pyams.models import Resistor
                 R1 = Resistor("a", "0"); R1.setParams("R=1KΩ")
             Every model instance created at the top level of the code becomes an element
             of the circuit (the variable name is the element name).
<analysis>   {"type": "Time Domain", "start": "0s", "step": "0.1us", "stop": "5ms",
              "outputs": {"names": ["Out1", "C1.I"], "color": ["#00ff00", "#ff0000"]},
              "options": {"uic": true}}                       ("oupouts" is accepted too)
             type: "Time Domain" | "AC" | "DC" (DC sweep when "param": "Element.Param" is given).
             Numbers may carry units / SI prefixes: "0.1us", "5ms", "1k", "2.2V".

Every line printed on stdout is one JSON object:
    {"event": "log",      "message": "...", "level": "info|warn|error"}
    {"event": "progress", "fraction": 0.42, "t": 0.0021}
    {"event": "result",   "data": {...}}                     (last line on success)
    {"event": "error",    "message": "...", "line": 7}       (last line on failure)
The output of print() calls inside the user code is forwarded as "log" events.
"""
import contextlib
import io
import json
import math
import sys
import traceback

_REAL_OUT = sys.stdout


def emit(**event):
    _REAL_OUT.write(json.dumps(event, ensure_ascii=False) + '\n')
    _REAL_OUT.flush()


def finite(values):
    """list of floats with nan / inf replaced by None (valid JSON)."""
    out = []
    for v in values:
        v = float(v)
        out.append(v if math.isfinite(v) else None)
    return out


def number(text, unit, parse):
    if isinstance(text, (int, float)):
        return float(text)
    return parse(str(text), unit)


def main(argv):
    ext_dir, code_file, analysis_file = argv[1], argv[2], argv[3]
    sys.path.insert(0, ext_dir)
    with open(code_file, 'r', encoding='utf-8-sig') as f:
        code = f.read()
    with open(analysis_file, 'r', encoding='utf-8-sig') as f:
        analysis = json.load(f)

    try:
        import numpy as np
        from pyams.lib import circuit, model, _parse_value
    except ImportError as exc:
        emit(event='error', message='Cannot import PyAMS (%s). Is numpy installed?' % exc)
        return 1

    # 1. run the user code --------------------------------------------------------------------
    emit(event='log', message='Running the circuit code...', level='info')
    namespace = {'__name__': '__main__'}
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, '<pyams code>', 'exec'), namespace)
    except BaseException as exc:
        tb = traceback.extract_tb(exc.__traceback__)
        line = next((fr.lineno for fr in reversed(tb) if fr.filename == '<pyams code>'), None)
        if isinstance(exc, SyntaxError):
            line = exc.lineno
        emit(event='error', message='%s: %s' % (type(exc).__name__, exc), line=line)
        return 1
    for text in out.getvalue().splitlines():
        emit(event='log', message=text, level='info')

    elements = {}
    for name, value in namespace.items():
        if isinstance(value, model) and not name.startswith('_'):
            elements[name] = value
    if not elements:
        emit(event='error', message='The code creates no element (no model instance found).')
        return 1
    emit(event='log', message='Elements: ' + ', '.join(elements), level='info')

    # 2. build the circuit and select the analysis --------------------------------------------
    try:
        kind = str(analysis.get('type', 'Time Domain')).strip().lower()
        outs = analysis.get('outputs') or analysis.get('oupouts') or {}
        names = list(outs.get('names', [])) if isinstance(outs, dict) else list(outs)

        cir = circuit()
        cir.addElements(elements)
        if names:
            cir.setOutPuts(*names)
        options = dict(analysis.get('options') or {})

        last = {'pct': -1}

        def progress(fraction, t):
            pct = int(fraction * 100)
            if pct != last['pct']:
                last['pct'] = pct
                emit(event='progress', fraction=fraction, t=t)

        if kind in ('time domain', 'time', 'transient', 'tran'):
            mode = 'tran'
            options.setdefault('progress', progress)
            cir.analysis(mode='tran',
                         start=number(analysis.get('start', 0), 's', _parse_value),
                         stop=number(analysis['stop'], 's', _parse_value),
                         step=number(analysis['step'], 's', _parse_value), **options)
        elif kind in ('ac', 'ac analysis'):
            mode = 'ac'
            if 'scale' in analysis:
                options.setdefault('scale', analysis['scale'])
            cir.analysis(mode='ac',
                         start=number(analysis['start'], 'Hz', _parse_value),
                         stop=number(analysis['stop'], 'Hz', _parse_value),
                         step=number(analysis['step'], '', _parse_value)
                         if analysis.get('step') is not None else None, **options)
        elif kind in ('dc', 'dc sweep', 'dc analysis', 'op', 'operating point'):
            mode = 'dc'
            param = analysis.get('param')
            if param and param != 'Non':
                ename, pname = str(param).split('.', 1)
                unit = str(elements[ename]._params[pname].unit).strip() if ename in elements \
                    and pname in elements[ename]._params else ''
                cir.analysis(mode='dc', param=param,
                             start=number(analysis['start'], unit, _parse_value),
                             stop=number(analysis['stop'], unit, _parse_value),
                             step=number(analysis['step'], unit, _parse_value), **options)
            else:
                cir.analysis(mode='dc', start=number(analysis.get('start', 0), 's', _parse_value),
                             **options)
        else:
            emit(event='error', message='Unknown analysis type: %r' % analysis.get('type'))
            return 1

        emit(event='log', message='Starting %s analysis...' % mode, level='info')
        results = cir.run()
    except BaseException as exc:
        emit(event='error', message='%s: %s' % (type(exc).__name__, exc))
        return 1

    # 3. convert the results to JSON ----------------------------------------------------------
    try:
        if isinstance(results, list):                       # parametric sweep (not used here)
            results = results[0]
        units = getattr(cir, '_units', {})
        if mode == 'ac':
            xkey, xlabel, xunit = 'freq', 'Frequency', 'Hz'
        elif 'sweep' in results:
            xkey, xlabel, xunit = 'sweep', analysis.get('param', 'sweep'), ''
        elif 'time' in results:
            xkey, xlabel, xunit = 'time', 'Time', 's'
        else:
            xkey, xlabel, xunit = None, 'Index', ''
        series = []
        for name in getattr(cir, '_out_names', []):
            col = np.asarray(results[name])
            item = {'name': name, 'unit': units.get(name, '')}
            if np.iscomplexobj(col):
                mag = np.abs(col)
                item['mag'] = finite(mag)
                item['db'] = finite(20.0 * np.log10(np.maximum(mag, 1e-300)))
                item['phase'] = finite(np.degrees(np.angle(col)))
                item['re'] = finite(col.real)
                item['im'] = finite(col.imag)
            else:
                item['y'] = finite(col)
            series.append(item)
        x = finite(results[xkey]) if xkey else list(range(len(series[0].get('y', []))) if series else [])
        emit(event='log', message='Done: %d point(s), %d output(s).' % (len(x), len(series)),
             level='success')
        emit(event='result', data={'mode': mode, 'xKey': xkey, 'xLabel': xlabel, 'xUnit': xunit,
                                   'x': x, 'series': series,
                                   'colors': (outs.get('color') if isinstance(outs, dict) else None) or []})
    except BaseException as exc:
        emit(event='error', message='Cannot read the results: %s: %s' % (type(exc).__name__, exc))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
