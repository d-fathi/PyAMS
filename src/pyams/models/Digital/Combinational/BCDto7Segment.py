#-------------------------------------------------------------------------------
# Name:        BCD to 7-Segment Decoder
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model

class BCD7SegmentDecoder(model):
    """ BCD to 7-Segment Decoder """
    def __init__(self, B0, B1, B2, B3, a, b, c, d, e, f, g):
        self.B0 = dsignal(direction='in', port=B0)
        self.B1 = dsignal(direction='in', port=B1)
        self.B2 = dsignal(direction='in', port=B2)
        self.B3 = dsignal(direction='in', port=B3)

        self.a = dsignal(direction='out', port=a)
        self.b = dsignal(direction='out', port=b)
        self.c = dsignal(direction='out', port=c)
        self.d = dsignal(direction='out', port=d)
        self.e = dsignal(direction='out', port=e)
        self.f = dsignal(direction='out', port=f)
        self.g = dsignal(direction='out', port=g)

    def digital(self):
        """ Decode 4-bit BCD to 7-segment output """
        b0 = self.B0
        b1 = self.B1
        b2 = self.B2
        b3 = self.B3

        # Segment a
        self.a += ~b3 & ~b2 & ~b1 & b0 | ~b3 & b2 & ~b1 & ~b0
        # Segment b
        self.b += ~b3 & b2 & ~b1 & b0 | ~b3 & b2 & b1 & ~b0
        # Segment c
        self.c += ~b3 & ~b2 & b1 & ~b0
        # Segment d
        self.d += ~b3 & b2 & ~b1 & ~b0 | ~b3 & b2 & b1 & b0
        # Segment e
        self.e += ~b3 & b0 | ~b3 & b2 & ~b1
        # Segment f
        self.f += ~b3 & ~b2 & b0 | ~b3 & ~b2 & b1
        # Segment g
        self.g += ~b3 & ~b2 & ~b1 | ~b3 & b2 & b1 & b0
