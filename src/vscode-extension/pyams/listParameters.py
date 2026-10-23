"""Run a PyAMS snippet and report every model instance it creates, as JSON.

Usage:  python listParameters.py <extension_dir> <code_file>

For the code

    from pyams.models import Resistor
    Rc1 = Resistor("Vcc", "Out1")
    Rc1.setParams("R=1KΩ")

the JSON printed on stdout is

    {"models": [{"name": "Rc1", "class": "Resistor", "doc": "...",
                 "init": [{"name": "p", "value": "Vcc"}, {"name": "n", "value": "Out1"}],
                 "setParams": ["R=1KΩ"],
                 "signals": [{"name": "V", "direction": "in", "kind": "voltage",
                              "p": "Vcc", "n": "Out1"}, ...],
                 "params": [{"name": "R", "value": 1000.0, "default": 1000.0,
                             "unit": "Ω", "description": "Resistance", "changed": false}]}],
     "error": null}

Output printed by the snippet itself is returned in "stdout" so that it never
corrupts the JSON.
"""
import contextlib
import inspect
import io
import json
import math
import sys
import traceback


def _num(x):
    """JSON-safe number (inf / nan are not valid JSON)."""
    try:
        x = float(x)
    except (TypeError, ValueError):
        return str(x)
    return x if math.isfinite(x) else str(x)


def _plain(x):
    if isinstance(x, (str, int, bool)) or x is None:
        return x
    if isinstance(x, float):
        return _num(x)
    if isinstance(x, (list, tuple)):
        return [_plain(i) for i in x]
    if isinstance(x, dict):
        return {str(k): _plain(v) for k, v in x.items()}
    return repr(x)


def _install_recorder(model):
    """Remember the constructor arguments and the setParams() calls of every
    model instance created from now on."""
    orig_new = model.__new__
    orig_set = model.setParams

    def __new__(cls, *args, **kwargs):
        obj = orig_new(cls, *args, **kwargs)
        object.__setattr__(obj, '_rec_init', (args, kwargs))
        object.__setattr__(obj, '_rec_calls', [])
        return obj

    def setParams(self, settings=None, **values):
        calls = self.__dict__.get('_rec_calls')
        if calls is not None:
            if settings is not None:
                calls.append(_plain(settings))
            if values:
                calls.append(_plain(values))
        return orig_set(self, settings, **values)

    model.__new__ = staticmethod(__new__)
    model.setParams = setParams


def _describe(name, obj, model):
    cls = type(obj)
    args, kwargs = obj.__dict__.get('_rec_init', ((), {}))

    # constructor arguments, named after the parameters of __init__
    init = []
    try:
        bound = inspect.signature(cls.__init__).bind(obj, *args, **kwargs)
        bound.apply_defaults()
        for pname, value in list(bound.arguments.items())[1:]:
            init.append({'name': pname, 'value': _plain(value)})
    except (TypeError, ValueError):
        init = [{'name': str(i), 'value': _plain(v)} for i, v in enumerate(args)]

    # defaults: the values declared in __init__, before any setParams()
    defaults = {}
    try:
        fresh = cls(*args, **kwargs)
        defaults = {k: float(v) for k, v in fresh._params.items()}
    except Exception:
        pass

    signals = [{
        'name': sname,
        'direction': s.direction,
        'kind': str(s.kind),
        'unit': getattr(s.kind, 'unit', ''),
        'p': _plain(s.p),
        'n': _plain(s.n),
    } for sname, s in obj._signals.items()]

    params = []
    for pname, p in obj._params.items():
        default = defaults.get(pname)
        params.append({
            'name': pname,
            'value': _num(p),
            'default': _num(default) if default is not None else None,
            'unit': str(p.unit).strip(),
            'description': p.description,
            'changed': default is not None and float(p) != default,
        })

    return {
        'name': name,
        'class': cls.__name__,
        'module': cls.__module__,
        'doc': inspect.getdoc(cls) or '',
        'init': init,
        'setParams': obj.__dict__.get('_rec_calls', []),
        'signals': signals,
        'params': params,
    }


def main(argv):
    result = {'models': [], 'error': None, 'stdout': ''}
    try:
        ext_dir, code_file = argv[1], argv[2]
        sys.path.insert(0, ext_dir)
        with open(code_file, 'r', encoding='utf-8-sig') as f:
            code = f.read()

        from pyams.lib import model
        _install_recorder(model)

        namespace = {'__name__': '__main__'}
        out = io.StringIO()
        try:
            with contextlib.redirect_stdout(out):
                exec(compile(code, '<pyams code>', 'exec'), namespace)
        except SystemExit:
            pass
        except BaseException as exc:
            tb = traceback.extract_tb(exc.__traceback__)
            line = next((fr.lineno for fr in reversed(tb) if fr.filename == '<pyams code>'), None)
            if isinstance(exc, SyntaxError):
                line = exc.lineno
            result['error'] = '%s: %s' % (type(exc).__name__, exc)
            result['line'] = line
        result['stdout'] = out.getvalue()

        seen = set()
        for name, value in list(namespace.items()):
            if isinstance(value, model) and id(value) not in seen:
                seen.add(id(value))
                result['models'].append(_describe(name, value, model))
    except Exception as exc:
        result['error'] = '%s: %s' % (type(exc).__name__, exc)
    sys.stdout.write(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
