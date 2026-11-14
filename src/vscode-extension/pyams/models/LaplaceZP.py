#-------------------------------------------------------------------------------
# Name:        Laplace transfer function in zero-pole form
# Author:      d.fathi
# Created:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
import numpy as np
from .LaplaceND import LaplaceND


def _groups(vals, tol=1e-9):
    """Split roots into real singles and complex-conjugate pairs."""
    vals = [complex(v) for v in vals]
    big = lambda v: abs(v.imag) > tol * max(abs(v), 1.0)
    reals = [[v.real] for v in vals if not big(v)]
    cplx = [v for v in vals if big(v) and v.imag > 0]
    if len([v for v in vals if big(v) and v.imag < 0]) != len(cplx):
        raise ValueError('complex roots must come in conjugate pairs')
    return reals + [[v, v.conjugate()] for v in cplx]


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
    The function is realised as a cascade of first / second order sections (real
    poles alone, complex pairs together; each zero group is attached to the
    nearest pole section), so high orders (elliptic, Butterworth ...) stay well
    conditioned.  Everything else (DC / AC / transient behaviour, limits) is
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
        self._num, self._den = k * num, den             # for poles() / zeros() / response()
        zg = _groups(self._zeros)
        pg = sorted(_groups(self._poles), key=lambda g: abs(g[0]))
        if len(num) > len(den):
            raise ValueError('improper transfer function: more zeros than poles')
        if not pg:
            self._build([([k], [1.0])])
            return
        cap = [len(g) for g in pg]
        assign = [[] for _ in pg]
        for g in sorted(zg, key=lambda g: abs(g[0])):    # nearest pole section with room
            order = sorted(range(len(pg)), key=lambda i: abs(abs(pg[i][0]) - abs(g[0])))
            for i in order:
                if cap[i] >= len(g):
                    assign[i].append(g); cap[i] -= len(g); break
            else:
                raise ValueError('cannot distribute the zeros over the pole sections')
        secs = []
        for i, g in enumerate(pg):
            zs = [v for grp in assign[i] for v in grp]
            nu = np.real(np.poly(zs)) if zs else np.array([1.0])
            secs.append([nu, np.real(np.poly(g))])
        secs[0][0] = secs[0][0] * k
        self._build([(nu, de) for nu, de in secs])
