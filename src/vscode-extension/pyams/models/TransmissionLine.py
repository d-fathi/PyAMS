#-------------------------------------------------------------------------------
# Name:        TransmissionLine (lossy line, lumped LC ladder)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt

_counter = [0]          # gives every line its own internal node names


# Transmission Line Model ------------------------------------------------------
class TransmissionLine(model):
    """
    Two-port (single-conductor) transmission line, modelled as a ladder of
    ``sections`` identical lumped sections (pi network: half a shunt capacitor
    at each end of every section).

          p1 --[R/N + L/N]--o--[R/N + L/N]--o-- ... --[R/N + L/N]-- p2
                            |                |
                         C/N, G/N         C/N, G/N      (C/2N, G/2N at the ends)
                            |                |
          ref ---------------------------------------------------------

    The line is described by its characteristic impedance and delay:

        L = Z0 * Td        total series inductance   (H)
        C = Td / Z0        total shunt capacitance   (F)
        R                  total series resistance   (Ohm)
        G                  total shunt conductance   (S)

    so a lossless line has the impedance Z0 = sqrt(L/C) and delays a signal by
    Td = sqrt(L C).  Every section has a series branch  V = (R/N) I + (L/N) dI/dt
    (its current is an extra unknown) and shunt currents  (C/N) dV/dt + (G/N) V.

    Terminals: TransmissionLine(p1, p2, ref="0", sections=20)
        p1, p2   the two ends of the line
        ref      the common (return) conductor, usually ground "0"
        sections number of lumped sections N (fixed when the element is made)

    Accuracy: a ladder is a low-pass filter whose cut-off is about
    N / (pi Td).  Use N >= 10 * Td / tr for a signal of rise time tr (for a
    sine wave N >= 10 * f * Td * 2 pi gives ~1 % in amplitude).  Large N
    costs more (about 2N unknowns).

    Attributes:
        Z0 (param): characteristic impedance, default 50 Ohm.
        Td (param): one-way delay of the line, default 1 ns.
        R (param): total series resistance of the line, default 0 Ohm.
        G (param): total shunt conductance of the line, default 0 S.
    """
    def __init__(self, p1, p2, ref="0", sections=20):
        n = int(sections)
        if n < 1:
            raise ValueError('sections must be >= 1')
        _counter[0] += 1
        tag = '_tl%d_' % _counter[0]
        # nodes: x[0] = p1 ... x[n] = p2, the middle ones are internal
        x = [p1] + [tag + str(k) for k in range(1, n)] + [p2]
        self.N = n
        # series branches (R + L) -----------------------------------------------
        self._si, self._sv = [], []
        for k in range(n):
            iname, vname = 'Is%d' % k, 'Vs%d' % k
            setattr(self, iname, signal('in', current, x[k], x[k + 1]))
            setattr(self, vname, signal('out', voltage, x[k], x[k + 1]))
            self._si.append(iname)
            self._sv.append(vname)
        # shunt branches (C || G) at every node --------------------------------
        self._pv, self._pi = [], []
        for k in range(n + 1):
            vname, iname = 'Vp%d' % k, 'Ip%d' % k
            setattr(self, vname, signal('in', voltage, x[k], ref))
            setattr(self, iname, signal('out', current, x[k], ref))
            self._pv.append(vname)
            self._pi.append(iname)

        self.Z0 = param(50.0, 'Ω', 'Characteristic impedance')
        self.Td = param(1e-9, 'Sec', 'One-way delay')
        self.R = param(0.0, 'Ω', 'Total series resistance')
        self.G = param(0.0, 'S', 'Total shunt conductance')

    def analog(self):
        n = self.N
        L = self.Z0 * self.Td / n          # per section
        C = self.Td / self.Z0 / n
        R = self.R / n
        G = self.G / n
        # series R + L ---------------------------------------------------------
        for iname, vname in zip(self._si, self._sv):
            i = getattr(self, iname)
            setattr(self, vname, getattr(self, vname) + R * i + L * ddt(i))
        # shunt C || G (half weight at the two ends) -----------------------------
        last = n
        for k, (vname, iname) in enumerate(zip(self._pv, self._pi)):
            w = 0.5 if k == 0 or k == last else 1.0
            v = getattr(self, vname)
            setattr(self, iname, getattr(self, iname) + w * (C * ddt(v) + G * v))
