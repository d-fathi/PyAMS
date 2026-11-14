#-------------------------------------------------------------------------------
# Name:        Flip-flops: D and JK (positive edge)
# Author:      d.fathi
# Created:     02/05/2025
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, param, dsignal


class _FF(model):
    def _pins(self, q, qn, rst, set_):
        self.Q = dsignal('out', q)
        self._has_qn = qn is not None
        if self._has_qn:
            self.Qn = dsignal('out', qn, init=1)
        self._has_rst = rst is not None
        if self._has_rst:
            self.Rst = dsignal('in', rst)
        self._has_set = set_ is not None
        if self._has_set:
            self.Set = dsignal('in', set_)
        self.Ic = param(0.0, ' ', 'Initial Q')

    def digital_reset(self):
        ic = 1 if float(self.Ic) > 0.5 else 0
        self.Q.reset(ic)
        if self._has_qn:
            self.Qn.reset(1 - ic)

    def _load(self, v):
        self.Q <<= v
        if self._has_qn:
            self.Qn <<= ~v

    def _async(self):
        """Asynchronous reset / set (active high, reset first); True if active."""
        if self._has_rst and self.Rst:
            self._load(0)
            return True
        if self._has_set and self.Set:
            self._load(1)
            return True
        return False


class DFF(_FF):
    """
    Positive-edge D flip-flop: Q takes D on the rising edge of Clk (after Tpd).
    Optional asynchronous reset (rst) and set (set_) pins, active high, reset first.

    Terminals: DFF(d, clk, q, qn=None, rst=None, set_=None)
    Parameter Ic: initial Q (0 or 1).
    """
    def __init__(self, d, clk, q, qn=None, rst=None, set_=None):
        self.D = dsignal('in', d)
        self.Clk = dsignal('in', clk)
        self._pins(q, qn, rst, set_)

    def digital(self):
        edge = self.Clk.rising
        if self._async():
            return
        if edge:
            self._load(self.D)


class JKFF(_FF):
    """
    Positive-edge JK flip-flop: on the rising edge of Clk
        J K = 00 hold, 01 reset, 10 set, 11 toggle,   i.e.  Q+ = J Q' + K' Q
    Optional asynchronous reset / set pins as in DFF.

    Terminals: JKFF(j, k, clk, q, qn=None, rst=None, set_=None)
    """
    def __init__(self, j, k, clk, q, qn=None, rst=None, set_=None):
        self.J = dsignal('in', j)
        self.K = dsignal('in', k)
        self.Clk = dsignal('in', clk)
        self._pins(q, qn, rst, set_)

    def digital(self):
        edge = self.Clk.rising
        if self._async():
            return
        if edge:
            self._load((self.J & ~self.Q) | (~self.K & self.Q))
