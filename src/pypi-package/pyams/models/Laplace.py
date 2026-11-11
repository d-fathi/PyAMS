#-------------------------------------------------------------------------------
# Name:        Laplace transfer function blocks (LaplaceND, LaplaceZP)
# Updated:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
import numpy as np
from pyams.lib import signal, param, model
from pyams.lib import voltage, current
from pyams.lib import ddt

_counter = [0]          # every block gets its own internal node names


def _scaled_section(num, den):
    """State-space data of one section H(s) = num(s)/den(s) (coefficients
    highest power first).  Time is scaled by w0 so the states stay well
    conditioned for any pole frequency."""
    num = [float(x) for x in np.atleast_1d(num)]
    den = [float(x) for x in np.atleast_1d(den)]
    while len(den) > 1 and den[0] == 0.0:
        den = den[1:]
    while len(num) > 1 and num[0] == 0.0:
        num = num[1:]
    if den[0] == 0.0:
        raise ValueError('the denominator is zero')
    n = len(den) - 1
    if len(num) - 1 > n:
        raise ValueError('improper transfer function: numerator degree (%d) > denominator degree (%d)'
                         % (len(num) - 1, n))
    a_n = den[0]
    den = [x / a_n for x in den]
    num = [x / a_n for x in num]
    if n == 0:
        return dict(n=0, w0=1.0, at=[], c=[], d=num[-1])
    roots = np.roots(den)
    mags = [abs(r) for r in roots if abs(r) > 0]
    w0 = float(np.exp(np.mean(np.log(mags)))) if mags else 1.0
    a = den[::-1]                           # a[k]: coefficient of s^k, a[n] = 1
    b = (num[::-1] + [0.0] * (n + 1))[:n + 1]
    at = [a[k] * w0 ** (k - n) for k in range(n)]
    bt = [b[k] * w0 ** (k - n) for k in range(n + 1)]
    d = bt[n]
    c = [bt[i] - d * at[i] for i in range(n)]
    return dict(n=n, w0=w0, at=at, c=c, d=d)


class _LaplaceBase(model):
    """Common machinery: a chain of state-space sections realised with
    internal nodes.  The state equations use ddt(), so

        * DC: all derivatives vanish and the block gives exactly H(0) u
          (a pole at s = 0 is given a tiny leak, Leak, so the DC point exists),
        * AC: exact H(j w),
        * transient: backward Euler / BDF2 like any other element.

    Terminals: (inp, inn, outp, outn): the input is the voltage V(inp)-V(inn)
    (it draws no current), the output is the voltage V(outp)-V(outn) that the
    block imposes (ideal voltage source, like a VCVS).
    """
    def _init_terminals(self, inp, inn, outp, outn):
        self._t = (inp, inn, outp, outn)
        _counter[0] += 1
        self._id = _counter[0]
        self.Leak = param(1e-9, ' ', 'Relative leak of a pole at the origin')
        self._names = []

    def _configure(self, sections):
        """Create the signals for a list of (num, den) sections."""
        for nm in self._names:                       # drop earlier signals
            self._signals.pop(nm, None)
            object.__delattr__(self, nm)
        self._names = []
        inp, inn, outp, outn = self._t
        self._sec = [_scaled_section(nu, de) for nu, de in sections]
        K = len(self._sec)
        self.U = signal('in', voltage, inp, inn); self._names.append('U')
        for k, s in enumerate(self._sec):
            if k > 0:
                nm = 'Z%d' % k
                setattr(self, nm, signal('in', voltage, '_lap%d_y%d' % (self._id, k - 1), '0')); self._names.append(nm)
            for i in range(s['n']):
                node = '_lap%d_s%d_%d' % (self._id, k, i + 1)
                setattr(self, 'X%d_%d' % (k, i), signal('in', voltage, node, '0'))
                setattr(self, 'E%d_%d' % (k, i), signal('out', current, node, '0'))
                self._names += ['X%d_%d' % (k, i), 'E%d_%d' % (k, i)]
            if k == K - 1:
                setattr(self, 'Y%d' % k, signal('out', voltage, outp, outn))
            else:
                setattr(self, 'Y%d' % k, signal('out', voltage, '_lap%d_y%d' % (self._id, k), '0'))
            self._names.append('Y%d' % k)

    def analog(self):
        leak = float(self.Leak)
        for k, s in enumerate(self._sec):
            u = float(self.U) if k == 0 else float(getattr(self, 'Z%d' % k))
            n, w0 = s['n'], s['w0']
            y = s['d'] * u
            if n:
                xs = [float(getattr(self, 'X%d_%d' % (k, i))) for i in range(n)]
                for i in range(n):
                    y += s['c'][i] * xs[i]
                for i in range(n - 1):
                    nm = 'E%d_%d' % (k, i)
                    setattr(self, nm, getattr(self, nm) + (ddt(getattr(self, 'X%d_%d' % (k, i))) - w0 * xs[i + 1]))
                at = list(s['at'])
                if at[0] == 0.0:
                    at[0] = leak
                acc = u
                for i in range(n):
                    acc -= at[i] * xs[i]
                nm = 'E%d_%d' % (k, n - 1)
                setattr(self, nm, getattr(self, nm) + (ddt(getattr(self, 'X%d_%d' % (k, n - 1))) - w0 * acc))
            nm = 'Y%d' % k
            setattr(self, nm, getattr(self, nm) + y)


class LaplaceND(_LaplaceBase):
    """
    Transfer function given by numerator / denominator coefficients,
    highest power of s first (scipy convention):

        H(s) = (b_m s^m + ... + b_0) / (a_n s^n + ... + a_0),       m <= n

        H1 = LaplaceND("in", "0", "out", "0", num=[1], den=[1e-3, 1])   # 1/(1 + 1e-3 s)
        H1.setTF(num=[1, 0, 1e6], den=[1, 1e3, 1e6])                    # change it later

    Terminals: LaplaceND(inp, inn, outp, outn, num=..., den=...)
    Best for low orders (up to about 6); use LaplaceZP (a cascade of 1st/2nd
    order sections) for higher orders.
    """
    def __init__(self, inp, inn, outp, outn, num=(1.0,), den=(1.0, 1.0)):
        self._init_terminals(inp, inn, outp, outn)
        self.setTF(num, den)

    def setTF(self, num, den):
        self._configure([(num, den)])

    def setNum(self, num):
        self.setTF(num, self._den)
        self._num = num

    def setDen(self, den):
        self.setTF(self._num, den)
        self._den = den

    def _configure(self, sections):
        self._num, self._den = sections[0]
        _LaplaceBase._configure(self, sections)


def _groups(vals, tol=1e-9):
    """Split roots into real singles and complex-conjugate pairs."""
    vals = [complex(v) for v in vals]
    reals, cplx = [], []
    for v in vals:
        if abs(v.imag) <= tol * max(abs(v), 1.0):
            reals.append(v.real)
        elif v.imag > 0:
            cplx.append(v)
    neg = [v for v in vals if v.imag < 0 and abs(v.imag) > tol * max(abs(v), 1.0)]
    if len(neg) != len(cplx):
        raise ValueError('complex roots must come in conjugate pairs')
    return [[r] for r in reals] + [[v, v.conjugate()] for v in cplx]


class LaplaceZP(_LaplaceBase):
    """
    Transfer function given by zeros, poles and gain:

        H(s) = K (s - z1)(s - z2)... / ((s - p1)(s - p2)...)

    Complex zeros/poles must come in conjugate pairs.  Internally the function
    is split into first/second-order sections in cascade, which keeps high
    orders (elliptic, Butterworth, ...) numerically well conditioned.

        H1 = LaplaceZP("in", "0", "out", "0", zeros=[], poles=[-1e3+2e3j, -1e3-2e3j], gain=5e6)
    """
    def __init__(self, inp, inn, outp, outn, zeros=(), poles=(-1.0,), gain=1.0):
        self._init_terminals(inp, inn, outp, outn)
        self.setZP(zeros, poles, gain)

    def setZP(self, zeros, poles, gain=1.0):
        zg = _groups(zeros)
        pg = sorted(_groups(poles), key=lambda g: abs(g[0]))
        if sum(len(g) for g in zg) > sum(len(g) for g in pg):
            raise ValueError('improper transfer function: more zeros than poles')
        if not pg:
            self._configure([([float(gain)], [1.0])])
            return
        cap = [len(g) for g in pg]
        assign = [[] for _ in pg]
        for g in sorted(zg, key=lambda g: abs(g[0])):       # nearest pole section with room
            order = sorted(range(len(pg)), key=lambda i: abs(abs(pg[i][0]) - abs(g[0])))
            for i in order:
                if cap[i] >= len(g):
                    assign[i].append(g); cap[i] -= len(g); break
            else:
                raise ValueError('cannot distribute the zeros over the pole sections')
        secs = []
        for i, g in enumerate(pg):
            zs = [z for grp in assign[i] for z in grp]
            nu = np.real(np.poly(zs)) if zs else np.array([1.0])
            de = np.real(np.poly(g))
            secs.append([nu, de])
        secs[0][0] = secs[0][0] * float(gain)
        self._configure([(nu, de) for nu, de in secs])
