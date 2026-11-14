#-------------------------------------------------------------------------------
# Name:        N-bit adder (dsignal)
# Author:      d.fathi
# Created:     14/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from pyams.lib import model, dsignal
from ._digital import pins


class Adder(model):
    """
    N-bit binary adder with carry:   {Cout, S} = A + B + Cin

        AD = Adder(["a0", "a1", "a2", "a3"], ["b0", "b1", "b2", "b3"], ["s0", "s1", "s2", "s3"], cin="ci", cout="co")
        AD = Adder("a", "b", "s", cout="co", width=8)           # 8 bits, nodes a[0..7] ...

    Terminals: Adder(a, b, s, cin=None, cout=None, width=None)
        a, b, s  buses (lists of nodes, LSB first, or names + width), cin / cout single bits (optional)
    A half adder is Adder with width 1 and no carry in, a full adder width 1 with carry in.
    """
    def __init__(self, a, b, s, cin=None, cout=None, width=None):
        self.A = pins(self, 'A', a, width, 'in')
        self.B = pins(self, 'B', b, width, 'in')
        self.S = pins(self, 'S', s, width, 'out')
        if not len(self.A) == len(self.B) == len(self.S):
            raise ValueError('Adder: A, B and S must have the same width')
        self._cin = cin is not None
        if self._cin:
            self.Cin = dsignal('in', cin)
        self._cout = cout is not None
        if self._cout:
            self.Cout = dsignal('out', cout)

    def digital(self):
        total = self.A + self.B + (self.Cin if self._cin else 0)
        self.S <<= total
        if self._cout:
            self.Cout <<= total >> len(self.S)
