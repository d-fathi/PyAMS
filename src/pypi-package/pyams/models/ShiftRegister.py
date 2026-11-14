#-------------------------------------------------------------------------------
# Name:        Serial-in shift register
# Author:      d.fathi
# Created:     02/05/2025
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, param, dsignal
from ._digital import pins


class ShiftRegister(model):
    """
    Serial-in shift register.  On the rising edge of Clk (after Tpd) every bit
    moves one place and Din enters at the first one:

        q0 <- Din,  q1 <- q0,  q2 <- q1, ...        Q+ = (Q << 1) | Din

        S = ShiftRegister("din", "clk", ["q0", "q1", "q2", "q3"], rst="rst")

    Terminals: ShiftRegister(din, clk, outs, rst=None, width=None)
        outs  list of the output nodes (first one = the bit that Din enters),
              or a name + width
        rst   asynchronous clear, active high (optional)
    Parameter Ic: initial content (integer, bit i = outs[i]).
    The content can be recorded with setOutPuts("S1.Q").
    """
    def __init__(self, din, clk, outs, rst=None, width=None):
        self.Din = dsignal('in', din)
        self.Clk = dsignal('in', clk)
        self._has_rst = rst is not None
        if self._has_rst:
            self.Rst = dsignal('in', rst)
        self.Q = pins(self, 'Q', outs, width, 'out')
        self.Ic = param(0.0, ' ', 'Initial content (integer)')

    def digital_reset(self):
        self.Q.reset(int(float(self.Ic)))

    def digital(self):
        edge = self.Clk.rising
        if self._has_rst and self.Rst:
            self.Q <<= 0
            return
        if edge:
            self.Q <<= (self.Q << 1) | self.Din
