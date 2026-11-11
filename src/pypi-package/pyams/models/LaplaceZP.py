#-------------------------------------------------------------------------------
# Name:        Laplace transfer function in zero-pole form
# Updated:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
import numpy as np
from .LaplaceND import LaplaceND


def _real_poly(roots, what):
    roots = np.array(roots, dtype=complex)
    p = np.poly(roots)
    if np.max(np.abs(p.imag)) > 1e-9 * max(1.0, np.max(np.abs(p.real))):
        raise ValueError('complex %s must come in conjugate pairs' % what)
    return p.real


class LaplaceZP(LaplaceND):
    """
    Laplace transfer function from zeros and poles (like ``laplace_zp``):

                     (s - z1)(s - z2) ... (s - zm)
        H(s) = K  -------------------------------      (m <= n)
                     (s - p1)(s - p2) ... (s - pn)

    Zeros and poles are in rad/s (complex numbers allowed, they must come in
    conjugate pairs).  K is ``Gain`` unless the DC gain is given.

        H = LaplaceZP("in", "0", "out", "0")
        H.setZeros([])
        H.setPoles([-1e3 + 2e3j, -1e3 - 2e3j])
        H.setGain(5e6)               # K of the formula above
        # or  H.setDcGain(1.0)       # choose K so that H(0) = 1

    or   LaplaceZP("in", "0", "out", "0", zeros=[], poles=[...], gain=5e6).
    Everything else (realisation, DC / AC / transient behaviour, limits) is
    described in LaplaceND.
    """
    def __init__(self, inp, inn, outp, outn, zeros=None, poles=None, gain=1.0, dc_gain=None):
        self._zeros = list(zeros) if zeros is not None else []
        self._poles = list(poles) if poles is not None else []
        self._K = float(gain)
        self._dc = None if dc_gain is None else float(dc_gain)
        super().__init__(inp, inn, outp, outn)
        self._rebuild()

    def setZeros(self, zeros):
        self._zeros = list(zeros); self._rebuild()

    def setPoles(self, poles):
        self._poles = list(poles); self._rebuild()

    def setGain(self, k):
        self._K = float(k); self._dc = None; self._rebuild()

    def setDcGain(self, g0):
        self._dc = float(g0); self._rebuild()

    def _rebuild(self):
        num = _real_poly(self._zeros, 'zeros') if self._zeros else np.array([1.0])
        den = _real_poly(self._poles, 'poles') if self._poles else np.array([1.0])
        if self._dc is not None:
            n0, d0 = num[-1], den[-1]
            if n0 == 0 or d0 == 0:
                raise ValueError('a pole or zero at s = 0: H(0) is not defined, use setGain')
            k = self._dc * d0 / n0
        else:
            k = self._K
        self._set(k * num, den)
