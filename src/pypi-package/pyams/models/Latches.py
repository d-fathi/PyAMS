#-------------------------------------------------------------------------------
# Name:        Latches: SR (NOR) and D
# Updated:     12/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import model, param, dsignal


class SRLatch(model):
    """
    SR latch (NOR type, active-high inputs).
        S = 1, R = 0 -> Q = 1      S = 0, R = 1 -> Q = 0
        S = 0, R = 0 -> holds      S = 1, R = 1 -> Q = Qn = 0 (forbidden state)

    Terminals: SRLatch(s, r, q, qn)       Parameter Ic: initial Q (0 or 1).
    """
    def __init__(self, s, r, q, qn):
        self.S = dsignal('in', s)
        self.R = dsignal('in', r)
        self.Q = dsignal('out', q)
        self.Qn = dsignal('out', qn, init=1)
        self.Ic = param(0.0, ' ', 'Initial Q')

    def digital_reset(self):
        ic = 1 if float(self.Ic) > 0.5 else 0
        self.Q.reset(ic)
        self.Qn.reset(1 - ic)

    def digital(self):
        s, r = int(self.S), int(self.R)
        if s and not r:
            self.Q <<= 1; self.Qn <<= 0
        elif r and not s:
            self.Q <<= 0; self.Qn <<= 1
        elif s and r:
            self.Q <<= 0; self.Qn <<= 0


class DLatch(model):
    """
    D latch: transparent (Q follows D) while En = 1, holds while En = 0.

    Terminals: DLatch(d, en, q, qn)       Parameter Ic: initial Q.
    """
    def __init__(self, d, en, q, qn):
        self.D = dsignal('in', d)
        self.En = dsignal('in', en)
        self.Q = dsignal('out', q)
        self.Qn = dsignal('out', qn, init=1)
        self.Ic = param(0.0, ' ', 'Initial Q')

    def digital_reset(self):
        ic = 1 if float(self.Ic) > 0.5 else 0
        self.Q.reset(ic)
        self.Qn.reset(1 - ic)

    def digital(self):
        if self.En:
            self.Q <<= self.D
            self.Qn <<= ~self.D
