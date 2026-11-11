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
    high-order filters stay well conditioned).  Consequences:
      * DC analysis / operating point: all derivatives are 0, so the states take
        their equilibrium values and the block gives exactly H(0) * u;
      * AC analysis gives exactly H(j w) (ddt is linearised);
      * transient runs use the normal BE / BDF2 integrator, zero initial state
        (at the operating point of the start of the run).

    Limits: only proper transfer functions (deg N <= deg D) are accepted;
    a pure delay e^(-sT) must be approximated by a rational (Pade) function.
    A pole at s = 0 (an integrator) is allowed, but the DC operating point
    of a circuit containing it is then not defined for a non-zero constant input.

    Parameters:
        Gain   extra gain factor multiplying the output   (1)
    """
    def __init__(self, inp, inn, outp, outn, num=None, den=None):
        self._nodes = (inp, inn, outp, outn)
        self._ports(inp, inn, outp, outn)
        self.Gain = param(1.0, ' ', 'Output gain')
        self._tag = '_lap%d' % (_counter[0] + 1)
        _counter[0] += 1
        self._z = []
        self._f = []
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
    def _set(self, num, den):
        num = np.atleast_1d(np.array(num, dtype=float))
        den = np.atleast_1d(np.array(den, dtype=float))
        num = np.trim_zeros(num, 'f')
        den = np.trim_zeros(den, 'f')
        if den.size == 0 or not np.all(np.isfinite(den)):
            raise ValueError('the denominator must be a non-zero polynomial')
        if num.size == 0:
            num = np.array([0.0])
        if num.size > den.size:
            raise ValueError('improper transfer function: degree of the numerator (%d) '
                             'is larger than the degree of the denominator (%d)'
                             % (num.size - 1, den.size - 1))
        self._num, self._den = num, den
        n = den.size - 1
        # drop the old state nodes
        for nm in self._z + self._f:
            self._signals.pop(nm, None)
        self._z, self._f = [], []
        # normalise the denominator
        an = den[0]
        d = den[::-1] / an                       # d[i] multiplies s^i, d[n] = 1
        nn = np.zeros(n + 1)
        nn[:num.size] = (num / an)[::-1]         # numerator coefficients, ascending
        poles = np.roots(den) if n > 0 else np.array([])
        mag = np.abs(poles[np.abs(poles) > 0]) if n > 0 else np.array([])
        w0 = float(np.exp(np.mean(np.log(mag)))) if mag.size else 1.0
        self._w0 = w0
        self._n = n
        if n == 0:
            self._e = np.array([])
            self._c = np.array([])
            self._dterm = float(nn[0])
            return
        i = np.arange(n)
        self._e = d[:n] * w0 ** (i - n)                          # e_i
        self._dterm = float(nn[n])                               # direct term (m = n)
        self._c = (nn[:n] - self._dterm * d[:n]) * w0 ** (i - n)  # output weights
        for k in range(n):
            node = '%s_x%d' % (self._tag, k + 1)
            zs = signal('in', voltage, node, '0')
            fs = signal('out', current, node, '0')
            setattr(self, '%s_z%d' % (self._tag, k), zs)
            setattr(self, '%s_f%d' % (self._tag, k), fs)
            self._z.append('%s_z%d' % (self._tag, k))     # attribute names: while a
            self._f.append('%s_f%d' % (self._tag, k))     # run is active the signals are plain floats

    def analog(self):
        u = self._read_in()
        g = float(self.Gain)
        n = self._n
        if n == 0:
            self._write_out(g * self._dterm * u)
            return
        z = [float(getattr(self, nm)) for nm in self._z]
        w0 = self._w0
        fn = self._f
        for k in range(n - 1):                         # dz_k/dt = w0 z_(k+1)
            setattr(self, fn[k], getattr(self, fn[k]) + ddt(z[k]) - w0 * z[k + 1])
        acc = u
        for i in range(n):
            acc -= self._e[i] * z[i]
        setattr(self, fn[n - 1], getattr(self, fn[n - 1]) + ddt(z[n - 1]) - w0 * acc)   # last state
        y = self._dterm * u
        for i in range(n):
            y += self._c[i] * z[i]
        self._write_out(g * y)
