#-------------------------------------------------------------------------------
# Name:        Logic gates with three inputs AND3 OR3 NAND3 NOR3
# Author:      d.fathi
# Created:     22/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, dsignal


class _Gate3(model):
    """Gate with the inputs A, B, C and the output Y (one bit each).  The output
    follows the inputs after the propagation delay Tpd (see dsignal: logic family
    and delay are the same as in Gates.py)."""
    def _setup(self, a, b, c, y):
        self.A = dsignal('in', a)
        self.B = dsignal('in', b)
        self.C = dsignal('in', c)
        self.Y = dsignal('out', y)

    def digital(self):
        self.Y <<= self.logic(self.A, self.B, self.C) & 1


class AND3(_Gate3):
    """3-input AND.  AND3(a, b, c, y)."""
    def __init__(self, a, b, c, y):
        self._setup(a, b, c, y)

    def logic(self, a, b, c):
        return a & b & c


class OR3(_Gate3):
    """3-input OR.  OR3(a, b, c, y)."""
    def __init__(self, a, b, c, y):
        self._setup(a, b, c, y)

    def logic(self, a, b, c):
        return a | b | c


class NAND3(_Gate3):
    """3-input NAND.  NAND3(a, b, c, y)."""
    def __init__(self, a, b, c, y):
        self._setup(a, b, c, y)

    def logic(self, a, b, c):
        return ~(a & b & c)


class NOR3(_Gate3):
    """3-input NOR.  NOR3(a, b, c, y)."""
    def __init__(self, a, b, c, y):
        self._setup(a, b, c, y)

    def logic(self, a, b, c):
        return ~(a | b | c)
