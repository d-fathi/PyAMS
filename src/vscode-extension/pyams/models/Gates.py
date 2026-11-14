#-------------------------------------------------------------------------------
# Name:        Logic gates NOT AND OR NAND NOR XOR XNOR
# Author:      d.fathi
# Created:     02/05/2025
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, dsignal


class _Gate(model):
    """Gate with the inputs A, B and the output Y (one bit each).  The output
    follows the inputs after the propagation delay Tpd (inertial: pulses
    shorter than Tpd are filtered out)."""
    def _setup(self, ins, out):
        self.A = dsignal('in', ins[0])
        if len(ins) > 1:
            self.B = dsignal('in', ins[1])
        self.Y = dsignal('out', out)

    def digital(self):
        if hasattr(self, 'B'):
            self.Y <<= self.logic(self.A, self.B) & 1
        else:
            self.Y <<= self.logic(self.A) & 1


class NOT(_Gate):
    """Inverter.  NOT(a, y).  Logic family and delay: see dsignal (Tpd = 10 ns)."""
    def __init__(self, a, y):
        self._setup((a,), y)

    def logic(self, a):
        return ~a


class AND(_Gate):
    """2-input AND.  AND(a, b, y)."""
    def __init__(self, a, b, y):
        self._setup((a, b), y)

    def logic(self, a, b):
        return a & b


class OR(_Gate):
    """2-input OR.  OR(a, b, y)."""
    def __init__(self, a, b, y):
        self._setup((a, b), y)

    def logic(self, a, b):
        return a | b


class NAND(_Gate):
    """2-input NAND.  NAND(a, b, y)."""
    def __init__(self, a, b, y):
        self._setup((a, b), y)

    def logic(self, a, b):
        return ~(a & b)


class NOR(_Gate):
    """2-input NOR.  NOR(a, b, y)."""
    def __init__(self, a, b, y):
        self._setup((a, b), y)

    def logic(self, a, b):
        return ~(a | b)


class XOR(_Gate):
    """2-input XOR.  XOR(a, b, y)."""
    def __init__(self, a, b, y):
        self._setup((a, b), y)

    def logic(self, a, b):
        return a ^ b


class XNOR(_Gate):
    """2-input XNOR.  XNOR(a, b, y)."""
    def __init__(self, a, b, y):
        self._setup((a, b), y)

    def logic(self, a, b):
        return ~(a ^ b)
