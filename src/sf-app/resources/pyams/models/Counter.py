#-------------------------------------------------------------------------------
# Name:        Synchronous binary counter
# Author:      d.fathi
# Created:     02/05/2025
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, param, dsignal
from ._digital import pins


class Counter(model):
    """
    Synchronous binary counter: the count changes on the rising edge of Clk
    (after Tpd).  The output is a bus Q (bit 0 = LSB).

        C = Counter("clk", ["q0", "q1", "q2"], rst="rst")      # 3 bits, q0 = LSB
        C = Counter("clk", "q", width=4)                       # nodes q[0] .. q[3]

    Terminals: Counter(clk, outs, rst=None, en=None, width=None)
        outs  list of the output nodes (LSB first), or a name + width
        rst   asynchronous clear, active high (optional)
        en    count enable, active high (optional, counts when left out)
    Parameters:
        Mod   modulus (count 0 .. Mod-1, then 0 again); 0 = 2**bits   (0)
        Down  1 = count down                                         (0)
        Ic    initial count                                          (0)
    The count can be recorded with setOutPuts("C1.Q").
    """
    def __init__(self, clk, outs, rst=None, en=None, width=None):
        self.Clk = dsignal('in', clk)
        self._has_rst = rst is not None
        if self._has_rst:
            self.Rst = dsignal('in', rst)
        self._has_en = en is not None
        if self._has_en:
            self.En = dsignal('in', en)
        self.Q = pins(self, 'Q', outs, width, 'out')
        self.Mod = param(0.0, ' ', 'Modulus (0 = 2**bits)')
        self.Down = param(0.0, ' ', '1 = count down')
        self.Ic = param(0.0, ' ', 'Initial count')

    def _modulus(self):
        m = int(float(self.Mod))
        return m if m > 0 else 1 << len(self.Q)

    def digital_reset(self):
        self.Q.reset(int(float(self.Ic)) % self._modulus())

    def digital(self):
        edge = self.Clk.rising
        if self._has_rst and self.Rst:
            self.Q <<= 0
            return
        if edge and (self.En if self._has_en else 1):
            step = -1 if float(self.Down) > 0.5 else 1
            self.Q <<= (self.Q + step) % self._modulus()
