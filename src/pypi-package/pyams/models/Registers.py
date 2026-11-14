#-------------------------------------------------------------------------------
# Name:        Registers, T flip-flop and LFSR (dsignal)
# Author:      d.fathi
# Created:     14/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from pyams.lib import model, param, dsignal
from ._digital import pins


class Register(model):
    """
    N-bit parallel register (positive edge): on the rising edge of Clk, Q takes D (when En = 1, if
    the optional enable pin is used).  Optional asynchronous clear Rst (active high).

        R = Register(["d0", "d1", "d2", "d3"], "clk", ["q0", "q1", "q2", "q3"], en="load", rst="rst")

    Terminals: Register(d, clk, q, en=None, rst=None, width=None)
    Parameter Ic: initial content (integer).
    """
    def __init__(self, d, clk, q, en=None, rst=None, width=None):
        self.D = pins(self, 'D', d, width, 'in')
        self.Clk = dsignal('in', clk)
        self.Q = pins(self, 'Q', q, width, 'out')
        if len(self.D) != len(self.Q):
            raise ValueError('Register: D and Q must have the same width')
        self._en = en is not None
        if self._en:
            self.En = dsignal('in', en)
        self._rst = rst is not None
        if self._rst:
            self.Rst = dsignal('in', rst)
        self.Ic = param(0.0, ' ', 'Initial content (integer)')

    def digital_reset(self):
        self.Q.reset(int(float(self.Ic)))

    def digital(self):
        edge = self.Clk.rising
        if self._rst and self.Rst:
            self.Q <<= 0
        elif edge and (self.En if self._en else 1):
            self.Q <<= self.D


class TFF(model):
    """
    Toggle flip-flop (positive edge): on the rising edge of Clk, Q toggles when T = 1 and holds when
    T = 0   (Q+ = Q ^ T).  With T = 1 it divides the clock frequency by 2.

    Terminals: TFF(t, clk, q, qn=None, rst=None)       Parameter Ic: initial Q.
    """
    def __init__(self, t, clk, q, qn=None, rst=None):
        self.T = dsignal('in', t)
        self.Clk = dsignal('in', clk)
        self.Q = dsignal('out', q)
        self._qn = qn is not None
        if self._qn:
            self.Qn = dsignal('out', qn, init=1)
        self._rst = rst is not None
        if self._rst:
            self.Rst = dsignal('in', rst)
        self.Ic = param(0.0, ' ', 'Initial Q')

    def digital_reset(self):
        ic = 1 if float(self.Ic) > 0.5 else 0
        self.Q.reset(ic)
        if self._qn:
            self.Qn.reset(1 - ic)

    def _load(self, v):
        self.Q <<= v
        if self._qn:
            self.Qn <<= 1 - v

    def digital(self):
        edge = self.Clk.rising
        if self._rst and self.Rst:
            self._load(0)
        elif edge and self.T:
            self._load(1 - int(self.Q))


class LFSR(model):
    """
    Linear-feedback shift register (Fibonacci type), a pseudo-random sequence generator.  On the
    rising edge of Clk the register shifts left and the new bit 0 is the XOR of the tapped bits:

        Q+ = ((Q << 1) | parity(Q & Taps)) & (2**N - 1)

    With the default taps the sequence has the maximum period 2**N - 1 (N = 2 ... 16); the all-zero
    state is never reached, so the seed Ic must not be 0.

    Terminals: LFSR(clk, outs, rst=None, width=None)
        outs  output nodes (list, LSB first) or a name + width;  rst  asynchronous load of the seed (optional)
    Parameters:
        Ic    seed (integer, not 0)                              1
        Taps  feedback tap mask (bit i = Q[i]); 0 = default maximum-length taps   0
    """
    _TAPS = {2: (1, 0), 3: (2, 1), 4: (3, 2), 5: (4, 2), 6: (5, 4), 7: (6, 5), 8: (7, 5, 4, 3),
             9: (8, 4), 10: (9, 6), 11: (10, 8), 12: (11, 10, 9, 3), 13: (12, 11, 10, 7),
             14: (13, 12, 11, 1), 15: (14, 13), 16: (15, 14, 12, 3)}

    def __init__(self, clk, outs, rst=None, width=None):
        self.Clk = dsignal('in', clk)
        self.Q = pins(self, 'Q', outs, width, 'out')
        self._rst = rst is not None
        if self._rst:
            self.Rst = dsignal('in', rst)
        self.Ic = param(1.0, ' ', 'Seed (not 0)')
        self.Taps = param(0.0, ' ', 'Tap mask (0 = maximum-length default)')

    def _mask(self):
        t = int(float(self.Taps))
        if t:
            return t
        n = len(self.Q)
        if n not in self._TAPS:
            raise ValueError('LFSR: no default taps for %d bits, set the parameter Taps' % n)
        return sum(1 << b for b in self._TAPS[n])

    def digital_reset(self):
        self.Q.reset(int(float(self.Ic)))

    def digital(self):
        edge = self.Clk.rising
        if self._rst and self.Rst:
            self.Q <<= int(float(self.Ic))
        elif edge:
            fb = bin(int(self.Q) & self._mask()).count('1') & 1
            self.Q <<= (self.Q << 1) | fb
