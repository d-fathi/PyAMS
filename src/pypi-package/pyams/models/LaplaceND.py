#-------------------------------------------------------------------------------
# Name:        Laplace transfer function  H(s) = N(s) / D(s)
# Updated:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
import numpy as np
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt

_counter = [0]            # every Laplace block gets its own internal state nodes


class LaplaceND(model):
    """
    Laplace transfer function block (like ``laplace_nd`` of Verilog-AMS):

                  b_m s^m + ... + b_1 s + b_0
        H(s) = ----------------------------------   (m <= n, proper)
                  a_n s^n + ... + a_1 s + a_0

    The output voltage between (outp, outn) is  Gain * H(s) * (input voltage
    between (inp, inn)).  The input draws no current and the output is an ideal
    voltage source, so blocks can be cascaded freely.

    Coefficients are lists with the HIGHEST power first (as in scipy.signal):

        H1 = LaplaceND("in", "0", "out", "0")
        H1.setNum([1])
        H1.setDen([1e-3, 1])                 # 1 / (1 + 1e-3 s)

    or  LaplaceND("in", "0", "out", "0", num=[1], den=[1e-3, 1]).

    How it works.  H(s) is realised as a state-space system in controllable
    canonical form with n states.  Each state is an internal node of the
    circuit and its equation uses ddt():

        dz_k/dt = w0 z_(k+1)                       (k < n)
        dz_n/dt = w0 (u - sum e_i z_(i+1))
        y       = sum c_i z_(i+1) + d u

    (time is scaled by w0, the geometric mean of the pole magnitudes, so that
    high-order filters stay well conditioned).  LaplaceZP splits the function
    into a cascade of 1st / 2nd order sections (each with its own states), which
    keeps elliptic / Butterworth filters of high order well conditioned.  Consequences:
      * DC analysis / operating point: all derivatives are 0, so the states take
        their equilibrium values and the block gives exactly H(0) * u;
      * AC analysis gives exactly H(j w) (ddt is linearised);
      * transient runs use the normal BE / BDF2 integrator, zero initial state
        (at the operating point of the start of the run).

    Limits: only proper transfer functions (deg N <= deg D) are accepted;
    a pure delay e^(-sT) must be approximated by a rational (Pade) function.
    A pole at s = 0 (an integrator) is allowed; it gets a tiny leak (Leak) so the
    DC operating point exists (for a non-zero constant input the output is then
    huge, as for any ideal integrator).

    Parameters:
        Gain   extra gain factor multiplying the output   (1)
        Leak   relative leak of a pole at the origin      (1e-9)
    """
    def __init__(self, inp, inn, outp, outn, num=None, den=None):
        self._nodes = (inp, inn, outp, outn)
        self._ports(inp, inn, outp, outn)
        self.Gain = param(1.0, ' ', 'Output gain')
        self.Leak = param(1e-9, ' ', 'Relative leak of a pole at the origin')
        self._tag = '_lap%d' % (_counter[0] + 1)
        _counter[0] += 1
        self._names = []
        self._sec = []
        self._num = np.array([1.0])
        self._den = np.array([1.0])
        self._set(num if num is not None else [1.0], den if den is not None else [1.0])

    # -- ports: voltage in / voltage out (LaplaceNDI overrides these three) ----------
    def _ports(self, inp, inn, outp, outn):
        self.U = signal('in', voltage, inp, inn)
        self.Y = signal('out', voltage, outp, outn)

    def _read_in(self):
        return float(self.U)

    def _write_out(self, y):
        self.Y += y

    # -- public setters ---------------------------------------------------------
    def setNum(self, num):
        self._set(num, self._den)

    def setDen(self, den):
        self._set(self._num, den)

    def setCoefficients(self, num, den):
        self._set(num, den)

    def poles(self):
        return np.roots(self._den)

    def zeros(self):
        return np.roots(self._num)

    def response(self, f):
        """H(j 2 pi f) of the block (without Gain), handy for checks."""
        s = 2j * np.pi * np.asarray(f, dtype=float)
        return np.polyval(self._num, s) / np.polyval(self._den, s)

    # -- realisation --------------------------------------------------------------
    @staticmethod
    def _scaled_section(num, den):
        """State-space data of one section num(s)/den(s) (highest power first), time
        scaled by w0 (geometric mean of the pole magnitudes)."""
        num = np.trim_zeros(np.atleast_1d(np.array(num, dtype=float)), 'f')
        den = np.trim_zeros(np.atleast_1d(np.array(den, dtype=float)), 'f')
        if den.size == 0 or not np.all(np.isfinite(den)):
            raise ValueError('the denominator must be a non-zero polynomial')
        if num.size == 0:
            num = np.array([0.0])
        if num.size > den.size:
            raise ValueError('improper transfer function: degree of the numerator (%d) '
                             'is larger than the degree of the denominator (%d)'
                             % (num.size - 1, den.size - 1))
        n = den.size - 1
        an = den[0]
        d = den[::-1] / an                       # d[i] multiplies s^i, d[n] = 1
        nn = np.zeros(n + 1)
        nn[:num.size] = (num / an)[::-1]         # numerator coefficients, ascending
        if n == 0:
            return dict(n=0, w0=1.0, e=np.array([]), c=np.array([]), d=float(nn[0]))
        poles = np.roots(den)
        mag = np.abs(poles[np.abs(poles) > 0])
        w0 = float(np.exp(np.mean(np.log(mag)))) if mag.size else 1.0
        i = np.arange(n)
        dterm = float(nn[n])
        return dict(n=n, w0=w0, e=d[:n] * w0 ** (i - n), d=dterm,
                    c=(nn[:n] - dterm * d[:n]) * w0 ** (i - n))

    def _set(self, num, den):
        """Single section (numerator / denominator)."""
        self._num = np.trim_zeros(np.atleast_1d(np.array(num, dtype=float)), 'f')
        self._den = np.trim_zeros(np.atleast_1d(np.array(den, dtype=float)), 'f')
        self._build([(num, den)])

    def _build(self, sections):
        """Create the state nodes of a cascade of (num, den) sections."""
        self._sec = [self._scaled_section(nu, de) for nu, de in sections]
        for nm in self._names:                           # drop the old state nodes
            self._signals.pop(nm, None)
        self._names = []
        K = len(self._sec)
        for k, sec in enumerate(self._sec):
            sec['x'] = []; sec['f'] = []
            if k > 0:                                    # input of this section = output of the previous
                nm = '%s_u%d' % (self._tag, k)
                setattr(self, nm, signal('in', voltage, '%s_y%d' % (self._tag, k - 1), '0'))
                self._names.append(nm); sec['u'] = nm
            for i in range(sec['n']):
                node = '%s_s%d_%d' % (self._tag, k, i + 1)
                xn, fn = '%s_z%d_%d' % (self._tag, k, i), '%s_f%d_%d' % (self._tag, k, i)
                setattr(self, xn, signal('in', voltage, node, '0'))
                setattr(self, fn, signal('out', current, node, '0'))
                sec['x'].append(xn); sec['f'].append(fn)
                self._names += [xn, fn]                  # attribute names: while a run is
            if k < K - 1:                                # active the signals are plain floats
                nm = '%s_y%d' % (self._tag, k)
                setattr(self, nm, signal('out', voltage, '%s_y%d' % (self._tag, k), '0'))
                self._names.append(nm); sec['y'] = nm

    def analog(self):
        g = float(self.Gain)
        leak = float(self.Leak)
        K = len(self._sec)
        for k, sec in enumerate(self._sec):
            u = self._read_in() if k == 0 else float(getattr(self, sec['u']))
            n, w0 = sec['n'], sec['w0']
            y = sec['d'] * u
            if n:
                z = [float(getattr(self, nm)) for nm in sec['x']]
                fn = sec['f']
                for i in range(n):
                    y += sec['c'][i] * z[i]
                for i in range(n - 1):                   # dz_i/dt = w0 z_(i+1)
                    setattr(self, fn[i], getattr(self, fn[i]) + ddt(z[i]) - w0 * z[i + 1])
                e = list(sec['e'])
                if e[0] == 0.0:                          # pole at the origin: tiny leak
                    e[0] = leak
                acc = u
                for i in range(n):
                    acc -= e[i] * z[i]
                setattr(self, fn[n - 1], getattr(self, fn[n - 1]) + ddt(z[n - 1]) - w0 * acc)
            if k == K - 1:
                self._write_out(g * y)
            else:
                setattr(self, sec['y'], getattr(self, sec['y']) + y)
