#-------------------------------------------------------------------------------
# Name:        pyams.lib
# Purpose:     Core of a small analog circuit simulator:
#                signal, param, model     -> describe an electronic element
#                voltage, current         -> the physical type of a signal
#                time                     -> the simulation time seen by models
#                circuit                  -> connects elements (by node name)
#                                            and runs DC / transient analysis
#-------------------------------------------------------------------------------
"""Core of the PyAMS-style circuit simulator.

Writing a model
---------------
A model is a class derived from ``model``.  ``__init__`` receives the terminals
(node names) and declares signals and parameters; ``analog()`` holds the
equations::

    class Resistor(model):
        def __init__(self, p, n):
            self.V = signal('in',  voltage, p, n)   # read:  V = v(p) - v(n)
            self.I = signal('out', current, p, n)   # write: current p -> n
            self.R = param(1000.0, 'Ω', 'Resistance')

        def analog(self):
            self.I += self.V / self.R

Signals (``signal(direction, kind, p, n)``)
    ('in',  voltage)  value of v(p) - v(n); read it inside analog().
    ('out', current)  ``sig += x`` adds a current x flowing from p to n through
                      the element (KCL: it leaves node p and enters node n).
    ('out', voltage)  ``sig += x`` imposes v(p) - v(n) = x (an ideal source);
                      the current through it becomes an extra unknown.
    ('in',  current)  value of the current of the ('out', voltage) signal that
                      sits on the same two nodes (current-controlled elements).

Inside analog() signals, parameters and ``time`` behave like plain floats, so
``math.exp``, ``math.sin`` ... can be applied to them directly.  ``ddt(x)`` gives
the time derivative of x (backward Euler; 0 in DC), e.g. a capacitor is
``self.I += self.C * ddt(self.V)``.

Solving
-------
Modified nodal analysis + Newton-Raphson.  The Jacobian is obtained by forward
finite differences of analog(), so a model only needs to state its equations.
Newton starts as a plain iteration; if that fails it is retried with limited
node-voltage steps, and in a transient run a failing time step is bisected.
Node "0" (also "gnd"/"ground") is the reference node.

Transient options (``circuit.analysis(mode="tran", ..., **options)``)
    order=1        ddt() is backward Euler (default): robust, first order.
    order=2        ddt() is variable-step BDF2: second order, still stable on
                   stiff, switching circuits.
    adaptive=True  the solver picks its own step (tiny at fast edges, large in
                   between) from an estimate of the local error and ``step``
                   becomes only the spacing of the output points, which are
                   interpolated.  lte / lte_abs set the tolerance (relative /
                   absolute volts, default 1e-4 / 1e-6) and max_step the
                   largest internal step (default 20*step).  It only has an
                   effect when some model uses ddt().  A pulse much shorter
                   than max_step can be stepped over: lower max_step then.
    reltol=...     Newton convergence tolerance (default 1e-6).
Defaults reproduce a fixed-step backward-Euler run exactly as before.

AC analysis (small signal)
--------------------------
``circuit.analysis(mode="ac", start=f1, stop=f2, step=N, scale="dec")``
solves the DC operating point, linearises every element around it (the same
finite differences, plus the sensitivity of the outputs to ``ddt()`` / ``idt()``)
and solves the complex system  (G + j w C + Q / (j w)) x = b  at every
frequency.  The stimulus comes from the sources that define ``ac()``
(ACVoltage, ACCurrent).  ``scale`` = "dec" / "oct": ``step`` points per decade
/ octave; "lin": ``step`` points in all.  ``run()`` returns
``{'freq': f, node_or_signal: complex phasors}``: with Vac = 1 the node
phasor is the transfer function (``20*log10(abs(x))``, ``angle(x, deg=True)``).
"""

import builtins
import math
import operator
import re
import sys
import unicodedata
from time import perf_counter as _clock     # wall clock ('time' is sim. time)

import numpy as np

__all__ = ['signal', 'param', 'model', 'voltage', 'current', 'time', 'ddt', 'idt',
           'accepting', 'circuit', 'SimulationError']


class SimulationError(RuntimeError):
    """Raised when a circuit cannot be built or solved."""


# ------------------------------------------------------------------------------
# Float-like helper (lets signals and time be used inside math formulas)
# ------------------------------------------------------------------------------
def _binary(op, reflected=False):
    def method(self, other):
        try:
            a, b = float(self), float(other)
        except (TypeError, ValueError):
            return NotImplemented
        return op(b, a) if reflected else op(a, b)
    return method


class _Numeric:
    """Mixin: an object that behaves like the float returned by float(self)."""
    __slots__ = ()

    def __float__(self):
        raise NotImplementedError

    def __int__(self):
        return int(float(self))

    def __bool__(self):
        return float(self) != 0.0

    def __neg__(self):
        return -float(self)

    def __pos__(self):
        return float(self)

    def __abs__(self):
        return abs(float(self))

    __add__ = _binary(operator.add)
    __radd__ = _binary(operator.add, True)
    __sub__ = _binary(operator.sub)
    __rsub__ = _binary(operator.sub, True)
    __mul__ = _binary(operator.mul)
    __rmul__ = _binary(operator.mul, True)
    __truediv__ = _binary(operator.truediv)
    __rtruediv__ = _binary(operator.truediv, True)
    __floordiv__ = _binary(operator.floordiv)
    __rfloordiv__ = _binary(operator.floordiv, True)
    __mod__ = _binary(operator.mod)
    __rmod__ = _binary(operator.mod, True)
    __pow__ = _binary(operator.pow)
    __rpow__ = _binary(operator.pow, True)
    __lt__ = _binary(operator.lt)
    __le__ = _binary(operator.le)
    __gt__ = _binary(operator.gt)
    __ge__ = _binary(operator.ge)
    __eq__ = _binary(operator.eq)
    __ne__ = _binary(operator.ne)
    __hash__ = object.__hash__          # identity hash (signals are never keys)


# ------------------------------------------------------------------------------
# Signal types and time
# ------------------------------------------------------------------------------
class SignalType:
    """Physical nature of a signal: voltage (V) or current (A)."""

    def __init__(self, name, unit):
        self.name = name
        self.unit = unit

    def __repr__(self):
        return self.name


voltage = SignalType('voltage', 'V')
current = SignalType('current', 'A')


class _Time(_Numeric):
    """Simulation time in seconds; read it inside analog() like a float."""
    __slots__ = ('value',)

    def __init__(self):
        self.value = 0.0

    def __float__(self):
        return float(self.value)

    def __repr__(self):
        return 'time(%r s)' % (self.value,)


time = _Time()

_active = {'circuit': None}      # the circuit being solved (used by ddt)


def accepting():
    """True while analog() is called to store an accepted time point.

    Models with a memory (a latch, a hysteresis) change their internal state
    only then, never during the Newton iterations of a step that may be
    rejected."""
    c = _active['circuit']
    return bool(c is not None and c._committing)


def ddt(x):
    """Time derivative of x, for use inside analog() (e.g. a capacitor).

    Backward Euler: (x - x_previous) / dt.  It is 0 in a DC analysis and at the
    initial operating point of a transient run.  Every call keeps its own
    history, so call ddt() unconditionally and in the same order each time
    analog() runs.
    """
    sim = _active['circuit']
    if sim is None:
        raise SimulationError('ddt() can only be called while a circuit is '
                              'being solved')
    return sim._ddt(float(x))


def idt(x, ic=0.0):
    """Time integral of x, for use inside analog() (e.g. an inductor:
    ``I = idt(V) / L``).

        idt(x, ic) = ic + integral of x dt, from the start of the run

    ``ic`` is the initial value (the integral at t = start).  In a DC analysis
    and at the initial operating point of a transient run the result is
    ``ic``.  Each step uses the trapezoidal rule (order=2, the default) or
    backward Euler (order=1).  Like ddt(), every call keeps its own state, so
    call idt() unconditionally and in the same order each time analog() runs.
    """
    sim = _active['circuit']
    if sim is None:
        raise SimulationError('idt() can only be called while a circuit is '
                              'being solved')
    return sim._idt(float(x), float(ic))


# ------------------------------------------------------------------------------
# signal
# ------------------------------------------------------------------------------
class signal(_Numeric):
    """A quantity attached to two terminals (p, n) of an element.

    direction: 'in'  -> the solver writes the value, analog() reads it
               'out' -> analog() accumulates a contribution with ``+=``
    kind:      voltage or current
    """
    __slots__ = ('direction', 'kind', 'p', 'n', 'value')

    def __init__(self, direction, kind, p, n):
        if direction not in ('in', 'out'):
            raise ValueError("signal direction must be 'in' or 'out', got %r"
                             % (direction,))
        if not isinstance(kind, SignalType):
            raise TypeError("signal kind must be voltage or current, got %r"
                            % (kind,))
        self.direction = direction
        self.kind = kind
        self.p = p
        self.n = n
        self.value = 0.0

    def __float__(self):
        return float(self.value)

    def __iadd__(self, other):
        self.value += float(other)
        return self

    def __isub__(self, other):
        self.value -= float(other)
        return self

    def __repr__(self):
        return 'signal(%r, %r, %r, %r)' % (self.direction, self.kind,
                                           self.p, self.n)


# ------------------------------------------------------------------------------
# param
# ------------------------------------------------------------------------------
class param(float):
    """A model parameter: a float that also carries a unit and a description."""

    def __new__(cls, value=0.0, unit='', description=''):
        obj = super().__new__(cls, value)
        obj.unit = unit
        obj.description = description
        return obj

    def __repr__(self):
        unit = str(self.unit).strip()
        return 'param(%s%s)' % (float.__repr__(self), ' ' + unit if unit else '')


# Parsing of "R=1KΩ Va=10V" -----------------------------------------------------
_PREFIXES = {'': 1.0, 'T': 1e12, 'G': 1e9, 'M': 1e6, 'Meg': 1e6, 'MEG': 1e6,
             'meg': 1e6, 'k': 1e3, 'K': 1e3, 'm': 1e-3, 'u': 1e-6, 'μ': 1e-6,
             'n': 1e-9, 'p': 1e-12, 'f': 1e-15}
_NUMBER = re.compile(r'([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*(.*)', re.S)


def _canon_unit(text):
    text = unicodedata.normalize('NFKC', str(text)).strip()   # Ω/µ variants
    text = re.sub(r'(?i)ohms?$', 'Ω', text)
    text = re.sub(r'(?i)deg$', '°', text)
    text = re.sub(r'(?i)sec(onds?)?$', 's', text)             # 'Sec' -> 's'
    return text


def _parse_value(text, unit=''):
    """'1KΩ' -> 1000.0 ; 'M' is mega, 'm' is milli, 'meg' is mega."""
    m = _NUMBER.fullmatch(unicodedata.normalize('NFKC', str(text)).strip())
    if m is None:
        raise ValueError('cannot read a number from %r' % (text,))
    number = float(m.group(1))
    suffix = _canon_unit(m.group(2))
    unit_c = _canon_unit(unit)
    if suffix == '':
        return number
    if unit_c and suffix == unit_c:
        return number
    if unit_c and suffix.endswith(unit_c):
        prefix = suffix[:-len(unit_c)]
        if prefix in _PREFIXES:
            return number * _PREFIXES[prefix]
    if suffix in _PREFIXES:
        return number * _PREFIXES[suffix]
    hint = ' (expected an SI prefix followed by %r)' % unit_c if unit_c else ''
    raise ValueError('cannot read the unit %r in %r%s' % (suffix, text, hint))


def _split_assignments(text):
    text = re.sub(r'\s*=\s*', '=', text.strip())
    result = {}
    for token in filter(None, re.split(r'[\s,;]+', text)):
        if '=' not in token:
            raise ValueError("expected 'name=value', got %r" % token)
        name, value = token.split('=', 1)
        result[name] = value
    return result


# ------------------------------------------------------------------------------
# model
# ------------------------------------------------------------------------------
class model:
    """Base class of every element.  Subclasses define signals, params, analog().

    Signals and parameters are registered automatically when they are assigned
    to an attribute, so subclasses do not need to call ``super().__init__()``.
    """

    def __new__(cls, *args, **kwargs):
        obj = super().__new__(cls)
        object.__setattr__(obj, '_signals', {})
        object.__setattr__(obj, '_params', {})
        return obj

    def __setattr__(self, name, value):
        if isinstance(value, signal):
            self._signals[name] = value
        elif isinstance(value, param):
            self._params[name] = value
        elif name in self._params and isinstance(value, (int, float)) \
                and not isinstance(value, bool):
            old = self._params[name]
            value = param(float(value), old.unit, old.description)
            self._params[name] = value
        object.__setattr__(self, name, value)

    def analog(self):
        raise NotImplementedError('%s must define analog()' % type(self).__name__)

    def getParams(self):
        """Return {name: param} for every declared parameter."""
        return dict(self._params)

    def setParams(self, settings=None, **values):
        """Set parameters: setParams("R=1KΩ Va=10V"), a dict, or keywords."""
        items = {}
        if settings is None:
            pass
        elif isinstance(settings, str):
            items.update(_split_assignments(settings))
        elif isinstance(settings, dict):
            items.update(settings)
        else:
            raise TypeError('setParams() expects a string or a dict')
        items.update(values)
        for name, raw in items.items():
            old = self._params.get(name)
            if old is None:
                raise ValueError("%s has no parameter %r (available: %s)" % (
                    type(self).__name__, name, ', '.join(self._params) or 'none'))
            number = _parse_value(raw, old.unit) if isinstance(raw, str) \
                else float(raw)
            setattr(self, name, param(number, old.unit, old.description))


# ------------------------------------------------------------------------------
# circuit
# ------------------------------------------------------------------------------
_GROUND = ('0', 'gnd', 'ground')


class _Elem:
    """An element prepared for solving (node numbers instead of names).

    in_specs  : (is_voltage, node_a, node_b, branch_col) for every 'in' signal
    out_specs : (is_voltage, node_p, node_n, branch_col) for every 'out' signal
    in_names / out_names: attribute names of those signals in the model

    While a circuit is running, the signal attributes of the model hold plain
    floats (the solver writes the 'in' values, analog() accumulates the 'out'
    ones), so the arithmetic inside analog() runs at native float speed.
    """
    __slots__ = ('name', 'model', 'd', 'in_specs', 'in_names', 'out_specs',
                 'out_names', 'hist', 'hist2', 'ihist', 'dynamic', 'orig_class')

    def __init__(self, name, mdl, in_specs, in_names, out_specs, out_names):
        self.name, self.model, self.d = name, mdl, mdl.__dict__
        self.in_specs, self.in_names = in_specs, in_names
        self.out_specs, self.out_names = out_specs, out_names
        self.hist = []              # ddt() history, one value per ddt() call
        self.hist2 = []             # the value one accepted step earlier (BDF2)
        self.ihist = {}             # idt(): call index -> (x, integral) accepted
        self.dynamic = False        # does analog() call ddt()?
        self.orig_class = type(mdl)


_fast_classes = {}


def _fast_class(cls):
    """A subclass of cls whose attribute assignment is the plain C one
    (``self.I += x`` then costs almost nothing)."""
    fast = _fast_classes.get(cls)
    if fast is None:
        fast = type(cls.__name__, (cls,), {'__setattr__': object.__setattr__,
                                           '__module__': cls.__module__})
        _fast_classes[cls] = fast
    return fast


class _Progress:
    """Progress report of a transient run.

    ``target`` is either True (a text bar on stderr) or a function
    ``callback(fraction, t)`` (for a GUI; raise an exception in it to abort).
    Updates are limited by the clock, not by the number of steps (about ten per
    second on a terminal), so the bar costs next to nothing.  When stderr is
    not a terminal (a log file, some IDE consoles) it prints a line every 10 %
    instead of rewriting one line.  Plain ASCII, so any console can show it."""

    def __init__(self, target, t_stop, width=28):
        self.callback = target if callable(target) else None
        self.t_stop = t_stop
        self.stream = sys.stderr
        try:
            self.tty = bool(self.stream.isatty())
        except Exception:
            self.tty = False
        self.width = width
        self.start = self.last = _clock()
        self.interval = 0.1 if (self.tty or self.callback) else 1.0
        self.next_pct = 10
        self.shown = False

    @staticmethod
    def _fmt(seconds):
        seconds = int(round(seconds))
        if seconds < 60:
            return '%ds' % seconds
        return '%dm%02ds' % divmod(seconds, 60)

    def update(self, fraction, t, force=False):
        now = _clock()
        if not force and now - self.last < self.interval:
            return
        self.last = now
        fraction = min(max(fraction, 0.0), 1.0)
        if self.callback is not None:
            self.callback(fraction, t)
            return
        elapsed = now - self.start
        pct = int(100.0 * fraction)
        if self.tty:
            filled = int(self.width * fraction)
            eta = ''
            if 0.02 < fraction < 1.0 and elapsed > 0.5:
                eta = '  ETA %s' % self._fmt(elapsed * (1.0 - fraction) / fraction)
            line = '[%s%s] %5.1f%%  t = %.4g s  %s%s' % (
                '#' * filled, '.' * (self.width - filled), 100.0 * fraction, t,
                self._fmt(elapsed), eta)
            self.stream.write('\r%-78s' % line)
            self.stream.flush()
            self.shown = True
        elif pct >= self.next_pct or force:
            self.stream.write('simulation %3d%%  t = %.4g s  (%s)\n' % (
                pct, t, self._fmt(elapsed)))
            self.stream.flush()
            self.next_pct = pct // 10 * 10 + 10

    def close(self, ok):
        """End of the run; ok=False when it stopped on an error."""
        if self.callback is not None:
            if ok:
                self.callback(1.0, self.t_stop)
            return
        if ok:
            self.update(1.0, self.t_stop, force=True)
        if self.tty and self.shown:
            self.stream.write('\n')
            self.stream.flush()


class circuit:
    """Connects elements through shared node names and analyses the result."""

    _MAX_HALVINGS = 24          # a time step may be bisected this many times
    _QUICK_ITER = 25            # Newton iterations tried before bisecting
    _SHRINK = 0.5               # a rejected adaptive step is shortened by this
    _NO_GROWTH_AFTER_REJECT = True  # ... and the next accepted one may not grow

    def __init__(self):
        self.elements = {}
        self.outputs = []
        self.options = dict(reltol=1e-6, vntol=1e-9, abstol=1e-12, gmin=1e-12,
                            maxiter=50, vlimit=1.0,
                            progress=False,   # True: text bar; or fn(fraction, t)
                            uic=False,        # True: start a transient from all-zero state (no DC point)
                            # variable time step (transient, opt-in) ----------
                            adaptive=False,   # True: step shrinks/grows by itself
                            lte=1e-4,         # relative local-error tolerance
                            lte_abs=1e-6,     # absolute local-error tolerance (V)
                            max_step=None,    # largest internal step (20*step)
                            scale='dec',      # AC frequency sweep: dec / oct / lin
                            order=1)          # ddt(): 1 = backward Euler,
                                              #        2 = variable-step BDF2
        self.stats = {}
        self.mode = None
        self.dc_sweep = None            # DC sweep (analysis(param=...))
        self.par_sweep = None        # parametric sweep (sweep(...))
        self.start = 0.0
        self.stop = None
        self.step = None
        self.results = None
        # state for ddt(): current step, element being evaluated, bookkeeping
        self._h = None
        self._h1 = None             # previous accepted step (BDF2)
        self._bdf2 = False          # is the step being solved a BDF2 step?
        self._dyn = []              # elements that call ddt()
        self._cur_el = None
        self._cidx = 0
        self._committing = False
        self._ac = None             # AC linearisation record (see _ac_call)
        self._last_error = ''

    # -- description ---------------------------------------------------------
    def addElements(self, elements):
        """Add elements given as {name: model_instance}."""
        if not isinstance(elements, dict):
            raise TypeError('addElements() expects a dict {name: element}')
        for name, element in elements.items():
            if not isinstance(element, model):
                raise TypeError('%r is not a model instance' % (name,))
            if '.' in str(name):
                raise ValueError("element names cannot contain '.': %r" % (name,))
            if name in self.elements:
                raise ValueError('element %r already exists' % (name,))
            self.elements[name] = element

    def setOutPuts(self, *names):
        """Choose what to record/plot: node names ("Out") or "Element.signal"
        ("D1.I", "R1.V")."""
        flat = []
        for name in names:
            flat.extend(name if isinstance(name, (list, tuple)) else [name])
        self.outputs = [str(n) for n in flat]

    def analysis(self, mode='tran', start=0.0, stop=None, step=None,
                 param=None, **options):
        """Select the analysis.

        'tran'  transient: start, stop, step (times in seconds).
        'dc'    without ``param``: one operating point (sources at t = start).
                with ``param="Element.Parameter"`` (or a one-item list): a DC
                sweep, the parameter goes from start to stop in steps of step
                and the operating point is solved at every value, e.g.
                ``analysis(mode="dc", param="Vg.Vdc", start=-2, stop=0, step=0.05)``.
                Every point starts from the previous solution, so a sweep
                costs little more than a single operating point.
        'ac'    small-signal frequency analysis from ``start`` to ``stop`` (Hz):
                ``step`` = points per decade (``scale="dec"``, default 20),
                per octave (``scale="oct"``) or in total (``scale="lin"``).
                run() returns {'freq': ..., name: complex phasors}.
        """
        if mode not in ('tran', 'dc', 'ac'):
            raise ValueError("mode must be 'tran', 'dc' or 'ac', got %r" % (mode,))
        if isinstance(param, (list, tuple)):
            if len(param) != 1:
                raise ValueError('param takes one "Element.Parameter" name; for '
                                 'a family of curves loop over the second one '
                                 'in Python and call run() each time')
            param = param[0]
            if isinstance(start, (list, tuple)):
                start = start[0]
            if isinstance(stop, (list, tuple)):
                stop = stop[0]
            if isinstance(step, (list, tuple)):
                step = step[0]
        dc_sweep = None
        if param is not None:
            if mode != 'dc':
                raise ValueError("param (a sweep) needs mode='dc'")
            if stop is None or step is None or step == 0:
                raise ValueError('a DC sweep needs start, stop and a non-zero step')
            ename, pname = self._resolve_param(param)
            if (stop - start) * step < 0:
                raise ValueError('step has the wrong sign for start -> stop')
            dc_sweep = (ename, pname)
        elif mode == 'ac':
            if stop is None or start is None or start <= 0 or stop <= start:
                raise ValueError('an AC analysis needs 0 < start < stop (Hz)')
            if step is not None and step <= 0:
                raise ValueError('step (points per decade/octave, or points '
                                 'in all for scale="lin") must be positive')
        elif mode == 'tran':
            if stop is None or step is None:
                raise ValueError("a transient analysis needs stop and step")
            if step <= 0 or stop <= start:
                raise ValueError("need step > 0 and stop > start")
        unknown = set(options) - set(self.options)
        if unknown:
            raise TypeError('unknown option(s) %s; valid: %s' % (
                ', '.join(sorted(unknown)), ', '.join(self.options)))
        self.options.update(options)
        self.mode, self.start, self.stop, self.step = mode, float(start), stop, step
        self.dc_sweep = dc_sweep

    def _resolve_param(self, param):
        """'Element.Parameter' -> (element name, parameter name), checked."""
        if '.' not in str(param):
            raise ValueError('param must be "Element.Parameter", got %r' % (param,))
        ename, pname = str(param).split('.', 1)
        mdl = self.elements.get(ename)
        if mdl is None:
            raise ValueError('unknown element %r in param %r (elements: %s)'
                             % (ename, param, ', '.join(self.elements)))
        if pname not in getattr(mdl, '_params', {}):
            raise ValueError('%s has no parameter %r (available: %s)' % (
                ename, pname, ', '.join(getattr(mdl, '_params', {})) or 'none'))
        return ename, pname

    def sweep(self, param=None, list=None):
        """Parametric sweep: repeat the whole analysis (transient, operating
        point or DC sweep) once for every value in ``list`` of the parameter
        ``param="Element.Parameter"``, e.g.::

            cir.sweep(param="Vg.Vdc", list=[0, -0.5, -1, -1.5])

        run() then returns a list with one results dict per value (each has
        the extra key 'param' = the value); plot() overlays them.
        ``cir.sweep()`` with no arguments switches the sweep off."""
        if param is None and list is None:
            self.par_sweep = None
            return
        if isinstance(param, (tuple, builtins.list)):
            if len(param) != 1:
                raise ValueError('sweep() takes one "Element.Parameter" name')
            param = param[0]
        if list is None or len(list) == 0:
            raise ValueError('sweep() needs list=[value, ...]')
        ename, pname = self._resolve_param(param)
        self.par_sweep = (ename, pname, [float(v) for v in list])

    # -- build the equation system -------------------------------------------
    def _compile(self):
        if not self.elements:
            raise SimulationError('the circuit has no elements; use addElements()')
        index = {}

        def node(name):
            key = str(name)
            if key.lower() in _GROUND:
                return -1
            if key not in index:
                index[key] = len(index)
            return index[key]

        for mdl in self.elements.values():
            for sig in mdl._signals.values():
                node(sig.p)
                node(sig.n)
        n_nodes = len(index)
        n_branch = 0
        elems = []
        for name, mdl in self.elements.items():
            if not mdl._signals:
                raise SimulationError('element %r declares no signals' % (name,))
            in_specs, in_names, out_specs, out_names, branch_of = [], [], [], [], {}
            for sname, sig in mdl._signals.items():
                if sig.direction != 'out':
                    continue
                p, n = node(sig.p), node(sig.n)
                if sig.kind is voltage:
                    col = n_nodes + n_branch
                    n_branch += 1
                    branch_of.setdefault((p, n), col)
                    out_specs.append((True, p, n, col))
                else:
                    out_specs.append((False, p, n, -1))
                out_names.append(sname)
            for sname, sig in mdl._signals.items():
                if sig.direction != 'in':
                    continue
                a, b = node(sig.p), node(sig.n)
                if sig.kind is voltage:
                    in_specs.append((True, a, b, -1))
                else:
                    col = branch_of.get((a, b))
                    if col is None:
                        raise SimulationError(
                            "element %r: an 'in' current signal needs an 'out' "
                            "voltage signal on the same two nodes" % (name,))
                    in_specs.append((False, a, b, col))
                in_names.append(sname)
            elems.append(_Elem(name, mdl, in_specs, in_names, out_specs,
                               out_names))
        size = n_nodes + n_branch
        if size == 0:
            raise SimulationError('the circuit has no nodes other than ground')
        self._elems = elems
        self._by_name = {e.name: e for e in elems}
        self._node_index = index
        self._n_nodes = n_nodes
        self._size = size
        self._abstol = np.array([self.options['vntol']] * n_nodes +
                                [self.options['abstol']] * n_branch)

    # -- evaluation of one element --------------------------------------------
    @staticmethod
    def _in_value(x, spec):
        if spec[0]:
            a, b = spec[1], spec[2]
            return (x[a] if a >= 0 else 0.0) - (x[b] if b >= 0 else 0.0)
        return x[spec[3]]

    def _eval(self, el, in_values):
        """Run analog() with the given 'in' values; return the 'out' values."""
        d = el.d
        for name, v in zip(el.in_names, in_values):
            d[name] = v
        for name in el.out_names:
            d[name] = 0.0
        self._cur_el = el
        self._cidx = 0
        el.model.analog()
        return [d[name] for name in el.out_names]

    def _ddt(self, x):
        """Backend of ddt(): the value of d(x)/dt for the call being evaluated."""
        if self._ac is not None:
            return self._ac_call(x, 'd', 0.0)
        el = self._cur_el
        i = self._cidx
        self._cidx = i + 1
        if not el.dynamic:
            el.dynamic = True
            self._dyn.append(el)
        hist = el.hist
        hist2 = el.hist2
        if self._committing:               # store x as the new history value
            if i < len(hist):
                if i < len(hist2):
                    hist2[i] = hist[i]
                else:
                    hist2.append(hist[i])
                hist[i] = x
            else:
                hist.append(x)
            return 0.0
        h = self._h
        if h is None or i >= len(hist):    # DC / initial point / no history yet
            return 0.0
        if self._bdf2 and i < len(hist2):  # variable-step BDF2, w = h / h_previous
            w = h / self._h1
            return ((1.0 + 2.0 * w) / (1.0 + w) * x - (1.0 + w) * hist[i]
                    + w * w / (1.0 + w) * hist2[i]) / h
        return (x - hist[i]) / h           # backward Euler

    def _idt(self, x, ic):
        """Backend of idt(): ic + integral of x for the call being evaluated."""
        if self._ac is not None:
            return self._ac_call(x, 'i', ic)
        el = self._cur_el
        i = self._cidx
        self._cidx = i + 1
        if not el.dynamic:
            el.dynamic = True
            self._dyn.append(el)
        h = self._h
        prev = el.ihist.get(i)
        if h is None or prev is None:      # DC / initial point: the integral is ic
            y = ic
        elif self.options['order'] == 2:   # trapezoidal rule
            y = prev[1] + 0.5 * h * (x + prev[0])
        else:                              # backward Euler
            y = prev[1] + h * x
        if self._committing:               # accept: (x, y) is the new state
            el.ihist[i] = (x, y)
        return y

    # -- AC (small-signal) analysis ---------------------------------------------
    def _ac_call(self, x, kind, ic):
        """ddt()/idt() while an element is being linearised: the value passed
        in is recorded (so its dependence on the unknowns can be measured) and
        the result is 0 (ddt) or ic (idt) plus an optional injected offset,
        which measures how the outputs depend on the derivative / integral."""
        rec = self._ac
        i = self._cidx
        self._cidx = i + 1
        rec['args'].append(x)
        rec['kinds'].append(kind)
        off = rec['inject'].get(i, 0.0)
        return off if kind == 'd' else ic + off

    def _ac_eval(self, el, inv, inject=None):
        rec = self._ac
        rec['args'], rec['kinds'], rec['inject'] = [], [], inject or {}
        out = self._eval(el, inv)
        return out, list(rec['args']), list(rec['kinds'])

    def _ac_linearize(self, el, x):
        """Small-signal matrices of one element at the operating point x
        (indexed [output][input]): G (resistive part), C (multiplies jw: the
        ddt() terms) and Q (multiplies 1/(jw): the idt() terms)."""
        in_specs, out_specs = el.in_specs, el.out_specs
        base = [self._in_value(x, s) for s in in_specs]
        nin, nout = len(in_specs), len(out_specs)
        out0, a0, kinds = self._ac_eval(el, base)
        K = len(a0)
        G = np.zeros((nout, nin))
        A = np.zeros((K, nin))                       # d(argument k) / d(input j)
        for j in range(nin):
            h = 1e-7 * max(1.0, abs(base[j]))
            hi = base[:]
            hi[j] += h
            up, au, _ = self._ac_eval(el, hi)
            for i in range(nout):
                G[i, j] = (up[i] - out0[i]) / h
            for k in range(min(K, len(au))):
                A[k, j] = (au[k] - a0[k]) / h
        C = np.zeros((nout, nin))
        Q = np.zeros((nout, nin))
        for k in range(K):
            if not np.any(A[k]):
                continue
            delta = 1.0e6 if kinds[k] == 'd' else 1.0   # large: no round-off in the difference
            up, _, _ = self._ac_eval(el, base, {k: delta})
            B = np.array([(up[i] - out0[i]) / delta for i in range(nout)])
            if kinds[k] == 'd':
                C += np.outer(B, A[k])
            else:
                Q += np.outer(B, A[k])
        return G, C, Q

    @staticmethod
    def _rows(spec):
        is_v, p, n, col = spec
        return ((col, -1.0),) if is_v else ((p, 1.0), (n, -1.0))

    @staticmethod
    def _cols(spec):
        is_v, a, b, col = spec
        return ((a, 1.0), (b, -1.0)) if is_v else ((col, 1.0),)

    def _ac_freqs(self):
        f1, f2, n = self.start, float(self.stop), self.step
        scale = self.options['scale']
        if scale == 'lin':
            n = int(n) if n else 101
            return np.linspace(f1, f2, max(n, 2))
        if scale not in ('dec', 'oct'):
            raise ValueError("scale must be 'dec', 'oct' or 'lin', got %r" % (scale,))
        per = float(n) if n else 20.0
        span = math.log10(f2 / f1) if scale == 'dec' else math.log2(f2 / f1)
        m = int(round(span * per)) + 1
        return np.logspace(math.log10(f1), math.log10(f2), max(m, 2))

    def _run_ac(self, names):
        """Small-signal frequency analysis around the DC operating point."""
        freqs = self._ac_freqs()
        size = self._size
        self._dyn = []
        self._h = self._h1 = None
        self._bdf2 = False
        _active['circuit'] = self
        self._freeze()
        try:
            time.value = 0.0
            x = self._solve_op(np.zeros(size), 0.0)
            if x is None:
                msg = 'the operating point of the AC analysis did not converge'
                if self._last_error:
                    msg += '. Last model error: ' + self._last_error
                raise SimulationError(msg)
            xl = x.tolist()
            state = self._assemble(x)
            if state is None:
                raise SimulationError('the AC analysis could not linearise the circuit')
            G = state[1]                                   # resistive part, with gmin
            Cm = np.zeros((size, size))
            Qm = np.zeros((size, size))
            b = np.zeros(size, dtype=complex)
            local = {}
            self._ac = {'args': [], 'kinds': [], 'inject': {}}
            try:
                for el in self._elems:
                    Gl, Cl, Ql = self._ac_linearize(el, xl)
                    local[el.name] = (Gl, Cl, Ql)
                    for M, L in ((Cm, Cl), (Qm, Ql)):
                        if not np.any(L):
                            continue
                        for i, osp in enumerate(el.out_specs):
                            for j, isp in enumerate(el.in_specs):
                                d = L[i, j]
                                if d == 0.0:
                                    continue
                                for r, cr in self._rows(osp):
                                    if r < 0:
                                        continue
                                    for c, cc in self._cols(isp):
                                        if c >= 0:
                                            M[r, c] += cr * cc * d
            finally:
                self._ac = None
            has_q = bool(np.any(Qm))
            # the stimulus of the AC sources
            stim = {}
            for el in self._elems:
                fn = getattr(el.model, 'ac', None)
                if not callable(fn):
                    continue
                sname, ph = fn()
                if sname not in el.out_names:
                    raise SimulationError('%s.ac() names the unknown signal %r'
                                          % (el.name, sname))
                k = el.out_names.index(sname)
                stim[(el.name, sname)] = ph
                is_v, p, n, col = el.out_specs[k]
                if is_v:
                    b[col] += ph                           # F = v(p) - v(n) - value
                else:
                    if p >= 0:
                        b[p] -= ph
                    if n >= 0:
                        b[n] += ph
            if not stim:
                raise SimulationError('the AC analysis needs a source with an AC '
                                      'stimulus (ACVoltage or ACCurrent)')
            probes = [self._make_ac_probe(nm, local, stim) for nm in names]
            cols = [[] for _ in probes]
            for f in freqs:
                w = 2.0 * math.pi * f
                Y = G + 1j * w * Cm
                if has_q:
                    Y = Y + Qm / (1j * w)
                try:
                    sol = np.linalg.solve(Y, b)
                except np.linalg.LinAlgError:
                    raise SimulationError('the AC matrix is singular at f = %g Hz '
                                          '(floating node or source loop?)' % f)
                for col, (_, _, fn) in zip(cols, probes):
                    col.append(fn(sol, w))
        finally:
            self._ac = None
            self._unfreeze()
            _active['circuit'] = None
            self._h = None
        self._out_names = names
        self._units = {name: unit for name, unit, _ in probes}
        self.results = {'freq': freqs}
        for name, col in zip(names, cols):
            self.results[name] = np.array(col, dtype=complex)
        return self.results

    def _make_ac_probe(self, name, local, stim):
        """Phasor probe: a node voltage, or an 'Element.signal'."""
        if '.' in name:
            ename, sname = name.split('.', 1)
            el = self._by_name[ename]
            sig = el.model._signals[sname]
            Gl, Cl, Ql = local[ename]
            if sname in el.in_names:
                spec = el.in_specs[el.in_names.index(sname)]
                def fn(sol, w, spec=spec):
                    if spec[0]:
                        a, b = spec[1], spec[2]
                        return (sol[a] if a >= 0 else 0.0) - (sol[b] if b >= 0 else 0.0)
                    return sol[spec[3]]
                return name, sig.kind.unit, fn
            k = el.out_names.index(sname)
            spec = el.out_specs[k]
            if spec[0]:                    # an imposed voltage: v(p) - v(n)
                def fn(sol, w, spec=spec):
                    p, n = spec[1], spec[2]
                    return (sol[p] if p >= 0 else 0.0) - (sol[n] if n >= 0 else 0.0)
                return name, 'V', fn
            ins = el.in_specs
            extra = stim.get((ename, sname), 0.0)
            def fn(sol, w, k=k, ins=ins, Gl=Gl, Cl=Cl, Ql=Ql, extra=extra):
                tot = extra
                for j, isp in enumerate(ins):
                    if isp[0]:
                        a, b = isp[1], isp[2]
                        v = (sol[a] if a >= 0 else 0.0) - (sol[b] if b >= 0 else 0.0)
                    else:
                        v = sol[isp[3]]
                    y = Gl[k, j] + 1j * w * Cl[k, j]
                    if Ql[k, j]:
                        y += Ql[k, j] / (1j * w)
                    tot += y * v
                return tot
            return name, 'A', fn
        if name.lower() in _GROUND:
            return name, 'V', lambda sol, w: 0.0 + 0.0j
        idx = self._node_index[name]
        return name, 'V', lambda sol, w, i=idx: sol[i]

    def _commit(self, x, t):
        """Accept the solution x at time t: it becomes the ddt() history."""
        if not self._dyn:
            return
        time.value = t
        xl = x.tolist()
        self._committing = True
        try:
            for el in self._dyn:
                self._eval(el, [self._in_value(xl, s) for s in el.in_specs])
        finally:
            self._committing = False
        self._h1 = self._h                 # the step just accepted

    def _stamp(self, el, x, F, J, want_jac):
        """Add the contribution of one element to F (and J) -- plain lists."""
        in_specs = el.in_specs
        out_specs = el.out_specs
        base = [self._in_value(x, s) for s in in_specs]
        out0 = self._eval(el, base)
        for (is_v, p, n, col), val in zip(out_specs, out0):
            if is_v:                       # v(p) - v(n) - value = 0, branch current
                vp = x[p] if p >= 0 else 0.0
                vn = x[n] if n >= 0 else 0.0
                F[col] += vp - vn - val
                if p >= 0:
                    F[p] += x[col]
                    if want_jac:
                        J[p][col] += 1.0
                        J[col][p] += 1.0
                if n >= 0:
                    F[n] -= x[col]
                    if want_jac:
                        J[n][col] -= 1.0
                        J[col][n] -= 1.0
            else:                          # current leaves p, enters n
                if p >= 0:
                    F[p] += val
                if n >= 0:
                    F[n] -= val
        if not want_jac:
            return
        # Jacobian by forward finite differences of analog()
        for j, (i_v, a, b, icol) in enumerate(in_specs):
            h = 1e-7 * max(1.0, abs(base[j]))
            hi = base[:]
            hi[j] += h
            up = self._eval(el, hi)
            cols = ((a, 1.0), (b, -1.0)) if i_v else ((icol, 1.0),)
            for i, (o_v, p, n, ocol) in enumerate(out_specs):
                d = (up[i] - out0[i]) / h
                if d == 0.0:
                    continue
                rows = ((ocol, -1.0),) if o_v else ((p, 1.0), (n, -1.0))
                for r, cr in rows:
                    if r < 0:
                        continue
                    Jr = J[r]
                    for c, cc in cols:
                        if c >= 0:
                            Jr[c] += cr * cc * d

    def _assemble(self, x, want_jac=True):
        """Return (F, J) at x (J is None when want_jac is False), or None if
        the models blow up there."""
        size = self._size
        F = [0.0] * size
        J = [[0.0] * size for _ in range(size)] if want_jac else None
        xl = x.tolist()
        for el in self._elems:
            try:
                self._stamp(el, xl, F, J, want_jac)
            except (OverflowError, ZeroDivisionError, ValueError) as err:
                if isinstance(err, ValueError) and \
                        'math domain error' not in str(err):
                    raise
                self._last_error = '%s in element %r (%s): %s' % (
                    type(err).__name__, el.name, type(el.model).__name__, err)
                return None
        gmin = self.options['gmin']
        for i in range(self._n_nodes):
            F[i] += gmin * xl[i]
            if want_jac:
                J[i][i] += gmin
        F = np.array(F)
        if not np.all(np.isfinite(F)):
            return None
        if want_jac:
            J = np.array(J)
            if not np.all(np.isfinite(J)):
                return None
        return F, J

    # -- solvers --------------------------------------------------------------
    def _newton(self, x0, vlim, maxiter=None):
        o = self.options
        nn = self._n_nodes
        reltol, abstol = o['reltol'], self._abstol
        if maxiter is None:
            maxiter = o['maxiter'] if vlim is None else 4 * o['maxiter']
        solve = np.linalg.solve
        x = x0.copy()
        state = self._assemble(x)
        if state is None:
            return None
        F, J = state
        for _ in range(maxiter):
            try:
                dx = solve(J, -F)
            except np.linalg.LinAlgError:
                return None
            if not np.all(np.isfinite(dx)):
                return None
            if np.all(np.abs(dx) <= reltol * np.abs(x) + abstol):
                return x + dx
            alpha = 1.0
            if vlim is not None and nn:
                biggest = float(np.max(np.abs(dx[:nn])))
                if biggest > vlim:
                    alpha = vlim / biggest
            f0 = float(np.max(np.abs(F))) if vlim is not None else 0.0
            while True:
                x_new = x + alpha * dx
                state = self._assemble(x_new, want_jac=False)
                # damped mode: also back off while the residual gets worse
                # (a very steep stage makes full Newton steps bounce between
                # the rails)
                if state is not None and (
                        vlim is None or alpha < 1e-3 or
                        float(np.max(np.abs(state[0]))) <= f0):
                    break
                if vlim is None:
                    return None
                alpha *= 0.5
                if alpha < 1e-6:
                    return None
            x = x_new
            if alpha == 1.0:
                # Cheap convergence test: reuse the Jacobian we already have
                # with the new residual (no new finite differences needed).
                try:
                    dx2 = solve(J, -state[0])
                except np.linalg.LinAlgError:
                    dx2 = None
                if dx2 is not None and np.all(np.isfinite(dx2)) and \
                        np.all(np.abs(dx2) <= reltol * np.abs(x) + abstol):
                    return x + dx2
            state = self._assemble(x)
            if state is None:
                return None
            F, J = state
        return None

    def _solve_point(self, x0, t, quick=False):
        """Newton solution at time t.  quick=True (transient steps): give up
        after a few iterations so the caller can bisect the step instead; the
        slower step-limited Newton is the fallback of last resort."""
        time.value = t
        self._last_error = ''
        if quick:
            return self._newton(x0, None, min(self.options['maxiter'],
                                              self._QUICK_ITER))
        for vlim in (None, self.options['vlimit']):
            x = self._newton(x0, vlim)
            if x is not None:
                return x
        return None

    def _solve_op(self, x0, t):
        """Operating point.  If plain Newton fails (very high gain stages),
        gmin stepping: solve with a large conductance from every node to
        ground, then lower it in decades, each solution seeding the next."""
        x = self._solve_point(x0, t)
        if x is not None:
            return x
        gmin = self.options['gmin']
        try:
            g, xs = 1e-2, x0
            while True:
                self.options['gmin'] = max(g, gmin)
                xs = self._solve_point(xs, t)
                if xs is None:
                    break
                if g <= gmin:
                    return xs
                g /= 10.0
        finally:
            self.options['gmin'] = gmin
        return self._pseudo_transient(x0, t)

    def _pseudo_transient(self, x0, t):
        """Last resort for the operating point (steep stages that make Newton
        bounce between the rails): let the circuit settle in artificial time.
        Sources are frozen at t, every ddt() starts from x0, and backward-Euler
        steps grow by x3 until the solution stops changing; the true DC
        equations are then solved from that settled state."""
        try:
            self._h, self._h1, self._bdf2 = None, None, False
            if self._assemble(x0) is None:
                return None
            x = x0.copy()
            self._commit(x, t)
            h = 1e-9
            for _ in range(60):
                self._h, self._bdf2 = h, False
                new = self._solve_point(x, t)
                if new is None:
                    return None
                settled = np.all(np.abs(new - x) <= 1e-9 * np.abs(new) + 1e-9)
                x = new
                self._commit(x, t)
                if settled and h > 1e-3:
                    break
                h *= 3.0
            self._h = None
            return self._solve_point(x, t)
        finally:
            self._h, self._h1, self._bdf2 = None, None, False

    def _advance(self, x, t0, t1, on_solved=None, depth=0):
        """Solve at t1 starting from the solution x at t0 (bisect on failure).

        ``on_solved(x, t1)`` is called for the point t1 itself, before the
        solution becomes the ddt() history (so probes see the same step)."""
        self._h = t1 - t0
        self._bdf2 = (self.options['order'] == 2 and self._h1 is not None
                      and self._h <= 2.0 * self._h1)
        last = depth >= self._MAX_HALVINGS
        new = self._solve_point(x, t1, quick=not last)
        if new is not None:
            if on_solved is not None:
                on_solved(new, t1)
            self._commit(new, t1)
            return new
        if last:
            msg = 'Newton iteration did not converge at t = %g s.' % t1
            if self._last_error:
                msg += ' Last model error: ' + self._last_error
            else:
                msg += (' Check for floating nodes, sources in parallel, or an '
                        'unbounded model equation. Circuits that switch '
                        'abruptly (multivibrators, latches) also need small '
                        'parasitic capacitances (e.g. a BJT with Cje, Cjc > 0).')
            raise SimulationError(msg)
        tm = 0.5 * (t0 + t1)
        xm = self._advance(x, t0, tm, None, depth + 1)
        return self._advance(xm, tm, t1, on_solved, depth + 1)

    def _run_adaptive(self, x, t_start, t_stop, record, acc_t, prog=None):
        """Variable-step transient from the accepted state x at t_start.

        One Newton solve per attempt.  The initial guess is an extrapolation of
        the accepted points (quadratic for BDF2 steps, linear otherwise) and the
        local error of the step is estimated from the distance between the
        solution and that prediction:

            backward Euler:  err = |x_new - x_pred| * h / (h + h1)
            BDF2          :  err = |x_new - x_pred| * Q / (P + Q)

        with P = h (h+h1) (h+h1+h2) / 6 the error constant of the quadratic
        predictor, Q = h^3 (1+w) / (6 a w) that of BDF2, w = h/h1 and
        a = (1+2w)/(1+w)  (Q/(P+Q) = 2/11 for a constant step).
        A step is accepted if err <= 1 against lte*|x| + lte_abs on the node
        voltages, and the next step is scaled by 0.9 err^(-1/p) (p = 2 or 3),
        at most x2 (BDF2 with a variable step needs h/h1 <= 2).
        Accepted points are passed to record(); their times go to acc_t."""
        o = self.options
        nn = self._n_nodes
        lte, lte_abs = o['lte'], o['lte_abs']
        want2 = o['order'] == 2
        h_max = o['max_step'] or 20.0 * self.step
        h_min = 1e-6 * self.step
        # The first step has no history to check it against, so start small
        # (a big first step can jump straight onto an unstable equilibrium);
        # the step then doubles after every accepted step.
        h = 0.1 * min(self.step, h_max, 1e-3 * (t_stop - t_start))
        t = t_start
        x1 = x2 = None                       # accepted points before x
        h1 = h2 = None                       # the steps that led to x and to x1
        accepted = rejected = 0
        after_reject = False
        while t < t_stop - 1e-12 * self.step:
            h = min(h, h_max, t_stop - t)
            t_new = t + h
            self._h = h
            bdf2 = want2 and h1 is not None and h <= 2.0 * h1
            self._bdf2 = bdf2
            pred = None
            quad = False
            if x1 is not None:
                if bdf2 and x2 is not None:  # quadratic extrapolation
                    L0 = (h + h1) * (h + h1 + h2) / (h1 * (h1 + h2))
                    L1 = -h * (h + h1 + h2) / (h1 * h2)
                    L2 = h * (h + h1) / ((h1 + h2) * h2)
                    pred = L0 * x + L1 * x1 + L2 * x2
                    quad = True
                else:                        # linear extrapolation
                    pred = x + (x - x1) * (h / h1)
            new = None
            if pred is not None:
                new = self._solve_point(pred, t_new, quick=True)
            if new is None:
                new = self._solve_point(x, t_new, quick=True)
            if new is None:                  # Newton failed: smaller step
                rejected += 1
                if h <= h_min:
                    new = self._solve_point(x, t_new)    # last resort
                    if new is None:
                        msg = 'Newton iteration did not converge at t = %g s.' % t_new
                        if self._last_error:
                            msg += ' Last model error: ' + self._last_error
                        else:
                            msg += (' Check for floating nodes, sources in '
                                    'parallel, or an unbounded model equation. '
                                    'Circuits that switch abruptly '
                                    '(multivibrators, latches) also need small '
                                    'parasitic capacitances (e.g. a BJT with '
                                    'Cje, Cjc > 0).')
                        raise SimulationError(msg)
                else:
                    h = max(0.25 * h, h_min)
                    continue
            err = 0.0
            if pred is not None and nn:
                tol = lte * np.maximum(np.abs(new[:nn]), np.abs(x[:nn])) + lte_abs
                dist = float(np.max(np.abs(new[:nn] - pred[:nn]) / tol))
                if quad:
                    w = h / h1
                    a = (1.0 + 2.0 * w) / (1.0 + w)
                    Q = h ** 3 * (1.0 + w) / (6.0 * a * w)
                    P = h * (h + h1) * (h + h1 + h2) / 6.0
                    err = dist * Q / (P + Q)
                else:
                    err = dist * h / (h + h1)
                if err > 1.0 and h > h_min:  # too inaccurate: retry shorter
                    rejected += 1
                    p = 3.0 if quad else 2.0
                    h = max(h * min(self._SHRINK, max(0.1, 0.9 * err ** (-1.0 / p))),
                            h_min)
                    after_reject = True
                    continue
            accepted += 1
            record(new, t_new)               # before commit: ddt probes see h
            self._commit(new, t_new)
            acc_t.append(t_new)
            x2, x1, x, t = x1, x, new, t_new
            h2, h1 = h1, h
            if prog is not None:
                prog.update((t - t_start) / (t_stop - t_start), t)
            p = 3.0 if quad else 2.0
            g = 2.0 if err < 1e-3 else min(2.0, 0.9 * err ** (-1.0 / p))
            if after_reject and self._NO_GROWTH_AFTER_REJECT:
                g = min(g, 1.0)
            after_reject = False
            h *= g
        self.stats = {'accepted': accepted, 'rejected': rejected}
        return x

    # -- speed: models run with plain-float signals and C-level setattr --------
    def _freeze(self):
        for el in self._elems:
            el.orig_class = type(el.model)
            el.model.__class__ = _fast_class(el.orig_class)

    def _unfreeze(self):
        """Give every model back its signal objects and its own class."""
        for el in self._elems:
            mdl = el.model
            mdl.__class__ = el.orig_class
            for sname, sig in mdl._signals.items():
                el.d[sname] = sig

    # -- outputs --------------------------------------------------------------
    def _make_probe(self, name):
        if '.' in name:
            ename, sname = name.split('.', 1)
            el = self._by_name.get(ename)
            if el is None:
                raise SimulationError('unknown element %r in output %r '
                                      '(elements: %s)' % (
                                          ename, name, ', '.join(self._by_name)))
            sig = el.model._signals.get(sname)
            if sig is None:
                raise SimulationError('element %r has no signal %r (signals: %s)'
                                      % (ename, sname,
                                         ', '.join(el.model._signals)))

            def fn(x, el=el, sname=sname):
                self._eval(el, [self._in_value(x, s) for s in el.in_specs])
                return float(el.d[sname])
            return name, sig.kind.unit, fn
        if name.lower() in _GROUND:
            return name, 'V', lambda x: 0.0
        idx = self._node_index.get(name)
        if idx is None:
            raise SimulationError('unknown node %r (nodes: %s)' % (
                name, ', '.join(self._node_index)))
        return name, 'V', lambda x, i=idx: x[i]

    def _time_points(self):
        n = int(math.floor((self.stop - self.start) / self.step + 1e-9))
        times = self.start + self.step * np.arange(n + 1)
        if times[-1] < self.stop - 1e-9 * self.step:
            times = np.append(times, self.stop)
        else:
            times[-1] = self.stop          # remove rounding noise at the end
        return times

    def run(self):
        """Run the selected analysis and return ``self.results``
        ({'time': array, output_name: array, ...}); with a parametric
        sweep() it is a list of such dicts, one per value, each with the
        extra key 'param' (the value used)."""
        if self.par_sweep is None:
            return self._run_single()
        if self.mode is None:
            raise SimulationError('call analysis() before run()')
        ename, pname, values = self.par_sweep
        mdl = self.elements[ename]
        original = mdl.__dict__[pname]
        runs = []
        try:
            for v in values:
                mdl.__dict__[pname] = float(v)
                res = dict(self._run_single())
                res['param'] = v
                runs.append(res)
        finally:
            mdl.__dict__[pname] = original
        self.results = runs
        return runs

    def _run_single(self):
        if self.mode is None:
            raise SimulationError('call analysis() before run()')
        self._compile()
        names = list(dict.fromkeys(self.outputs)) or list(self._node_index)
        probes = [self._make_probe(n) for n in names]
        if self.mode == 'ac':
            return self._run_ac(names)
        if self.dc_sweep:
            return self._run_sweep(names, probes)
        times = self._time_points() if self.mode == 'tran' \
            else np.array([self.start])

        columns = [[] for _ in probes]

        def record(x, t):
            time.value = t
            xl = x.tolist()
            for col, (_, _, fn) in zip(columns, probes):
                col.append(fn(xl))

        self._dyn = []
        self._h = None                       # ddt() = 0 at the operating point
        self._h1 = None
        self._bdf2 = False
        if self.options['order'] not in (1, 2):
            raise ValueError('order must be 1 (backward Euler) or 2 (BDF2)')
        prog = None
        if self.mode == 'tran' and self.options['progress']:
            prog = _Progress(self.options['progress'], times[-1])
        ok = False
        _active['circuit'] = self
        self._freeze()
        try:
            if self.mode == 'tran' and self.options['uic']:
                # 'use initial conditions': skip the operating point and start
                # with everything at 0 (capacitors uncharged, inductors with no
                # current) - a circuit that is switched on at t = start.
                x = np.zeros(self._size)
                time.value = times[0]
                xl = x.tolist()
                for el in self._elems:       # find the elements that call ddt()
                    self._eval(el, [self._in_value(xl, sp) for sp in el.in_specs])
            else:
                x = self._solve_op(np.zeros(self._size), times[0])
            if x is None:
                msg = ('the operating point at t = %g s did not converge'
                       % times[0])
                if self._last_error:
                    msg += '. Last model error: ' + self._last_error
                raise SimulationError(msg)
            record(x, times[0])
            self._commit(x, times[0])
            acc_t = None
            if self.mode == 'tran' and self.options['adaptive'] and self._dyn:
                acc_t = [times[0]]
                self._run_adaptive(x, times[0], times[-1], record, acc_t, prog)
            else:
                n_steps = len(times) - 1
                for k, (t0, t1) in enumerate(zip(times[:-1], times[1:]), 1):
                    x = self._advance(x, t0, t1, record)
                    if prog is not None:
                        prog.update(k / n_steps, t1)
            ok = True
        finally:
            self._unfreeze()
            _active['circuit'] = None
            self._h = None
            if prog is not None:
                prog.close(ok)

        self._out_names = names
        self._units = {name: unit for name, unit, _ in probes}
        self.results = {'time': times}
        for name, col in zip(names, columns):
            # adaptive run: the accepted points are not on the output grid
            self.results[name] = np.interp(times, acc_t, col) \
                if acc_t is not None else np.array(col)
        return self.results

    def _run_sweep(self, names, probes):
        """DC sweep: solve the operating point for every value of the swept
        parameter, each one starting from the previous solution."""
        ename, pname = self.dc_sweep
        n = int(math.floor(abs((self.stop - self.start) / self.step) + 1e-9))
        values = self.start + self.step * np.arange(n + 1)
        el = self._by_name[ename]
        original = el.d[pname]
        columns = [[] for _ in probes]
        self._dyn = []
        self._h = self._h1 = None
        self._bdf2 = False
        _active['circuit'] = self
        self._freeze()
        try:
            time.value = 0.0
            x = np.zeros(self._size)
            for k, v in enumerate(values):
                el.d[pname] = float(v)
                new = self._solve_op(x, 0.0)
                if new is None and k:
                    new = self._solve_op(np.zeros(self._size), 0.0)
                if new is None:
                    msg = ('the DC sweep did not converge at %s.%s = %g'
                           % (ename, pname, v))
                    if self._last_error:
                        msg += '. Last model error: ' + self._last_error
                    raise SimulationError(msg)
                x = new
                xl = x.tolist()
                for col, (_, _, fn) in zip(columns, probes):
                    col.append(fn(xl))
                self._commit(x, 0.0)
        finally:
            el.d[pname] = original
            self._unfreeze()
            _active['circuit'] = None
            self._h = None
        self._out_names = names
        self._units = {name: unit for name, unit, _ in probes}
        label = '%s.%s' % (ename, pname)
        self.results = {'sweep': values, label: values}
        for name, col in zip(names, columns):
            self.results[name] = np.array(col)
        return self.results

    def _plot_ac(self, runs, many, filename, show):
        """Bode plot: magnitude in dB (20 log10 |x|) and phase in degrees."""
        import matplotlib.pyplot as plt
        surface, ink, ink2 = '#fcfcfb', '#0b0b0b', '#52514e'
        muted, grid, axis = '#898781', '#e1e0d9', '#c3c2b7'
        series = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100',
                  '#e87ba4', '#008300', '#6250d6', '#e34948']
        dashes = ['-', '--', ':', '-.']
        fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(9, 6.6))
        fig.patch.set_facecolor(surface)
        if many:
            pn = '%s.%s' % self.par_sweep[:2]
        for ax in (ax1, ax2):
            ax.set_facecolor(surface)
            ax.grid(color=grid, linewidth=0.8, which='both' if self.options['scale'] != 'lin' else 'major')
            ax.set_axisbelow(True)
            for side in ('top', 'right'):
                ax.spines[side].set_visible(False)
            for side in ('left', 'bottom'):
                ax.spines[side].set_color(axis)
            ax.tick_params(colors=muted, labelcolor=ink2)
        for k, res in enumerate(runs):
            f = res['freq']
            for name in self._out_names:
                n = self._out_names.index(name)
                if many and len(self._out_names) == 1:
                    color, style = series[k % len(series)], '-'
                    label = '%s = %g' % (pn, res['param'])
                elif many:
                    color = series[n % len(series)]
                    style = dashes[k % len(dashes)]
                    label = '%s (%s = %g)' % (name, pn, res['param'])
                else:
                    color, style, label = series[n % len(series)], '-', name
                z = res[name]
                mag = 20.0 * np.log10(np.maximum(np.abs(z), 1e-300))
                ph = np.degrees(np.unwrap(np.angle(z)))
                ax1.plot(f, mag, color=color, linestyle=style, linewidth=1.8, label=label)
                ax2.plot(f, ph, color=color, linestyle=style, linewidth=1.8)
        if self.options['scale'] != 'lin':
            ax1.set_xscale('log')
        ax1.set_ylabel('Magnitude (dB)', color=ink2)
        ax2.set_ylabel('Phase (deg)', color=ink2)
        ax2.set_xlabel('Frequency (Hz)', color=ink2)
        if many or len(self._out_names) > 1:
            ax1.legend(loc='lower right', bbox_to_anchor=(1.0, 1.0), ncol=4,
                       frameon=False, labelcolor=ink2, borderaxespad=0.2)
        else:
            ax1.set_title(self._out_names[0], loc='left', fontsize=10, color=ink2)
        fig.suptitle('AC analysis', x=0.01, ha='left', color=ink, fontsize=12)
        fig.tight_layout()
        if filename:
            fig.savefig(filename, dpi=150, facecolor=surface)
        if show:
            plt.show()
        return fig

    def plot(self, filename=None, show=True):
        """Plot the recorded outputs against time (one panel per unit)."""
        if self.results is None:
            raise SimulationError('nothing to plot: call run() first')
        many = isinstance(self.results, builtins.list)
        runs = self.results if many else [self.results]
        if self.mode == 'ac':
            return self._plot_ac(runs, many, filename, show)
        if self.mode != 'tran' and not self.dc_sweep:
            raise SimulationError("plot() needs a transient analysis, an AC "
                                  "analysis or a DC sweep (mode='dc' with param=...)")
        import matplotlib.pyplot as plt

        surface, ink, ink2 = '#fcfcfb', '#0b0b0b', '#52514e'
        muted, grid, axis = '#898781', '#e1e0d9', '#c3c2b7'
        series = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100',
                  '#e87ba4', '#008300', '#6250d6', '#e34948']
        quantity = {'V': 'Voltage', 'A': 'Current'}

        groups = {}
        for name in self._out_names:
            groups.setdefault(self._units[name], []).append(name)
        fig, axes = plt.subplots(len(groups), 1, sharex=True, squeeze=False,
                                 figsize=(9, 3.6 * len(groups) + 0.6))
        fig.patch.set_facecolor(surface)
        xkey = 'sweep' if self.dc_sweep else 'time'
        dashes = ['-', '--', ':', '-.']
        if many:
            pn = '%s.%s' % self.par_sweep[:2]
            tags = [('%s = %g' % (pn, r['param'])) for r in runs]
        for ax, (unit, names) in zip(axes[:, 0], groups.items()):
            ax.set_facecolor(surface)
            for k, res in enumerate(runs):
                for name in names:
                    if many and len(names) == 1:     # colour tells the run
                        color, style = series[k % len(series)], '-'
                        label = tags[k]
                    elif many:                       # colour = output, style = run
                        color = series[self._out_names.index(name) % len(series)]
                        style = dashes[k % len(dashes)]
                        label = '%s (%s)' % (name, tags[k])
                    else:
                        color = series[self._out_names.index(name) % len(series)]
                        style, label = '-', name
                    ax.plot(res[xkey], res[name], color=color, linestyle=style,
                            linewidth=1.8, label=label, solid_capstyle='round')
            ax.grid(axis='y', color=grid, linewidth=0.8)
            ax.set_axisbelow(True)
            for side in ('top', 'right'):
                ax.spines[side].set_visible(False)
            for side in ('left', 'bottom'):
                ax.spines[side].set_color(axis)
            ax.tick_params(colors=muted, labelcolor=ink2)
            ax.set_ylabel('%s (%s)' % (quantity.get(unit, unit), unit), color=ink2)
            if len(names) > 1 or many:
                # one row above the axes, so it never covers a trace
                ax.legend(loc='lower right', bbox_to_anchor=(1.0, 1.0),
                          ncol=min(len(runs) * len(names), 4), frameon=False,
                          labelcolor=ink2, borderaxespad=0.2)
            else:
                ax.set_title(names[0], loc='left', fontsize=10, color=ink2)
        if self.dc_sweep:
            xlabel, title = '%s.%s' % self.dc_sweep, 'DC sweep'
        else:
            xlabel, title = 'Time (s)', 'Transient analysis'
        axes[-1, 0].set_xlabel(xlabel, color=ink2)
        fig.suptitle(title, x=0.01, ha='left', color=ink,
                     fontsize=12)
        fig.tight_layout()
        if filename:
            fig.savefig(filename, dpi=150, facecolor=surface)
        if show:
            plt.show()
        return fig
