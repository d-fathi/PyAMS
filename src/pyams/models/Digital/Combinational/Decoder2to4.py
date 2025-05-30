#-------------------------------------------------------------------------------
# Name:        2-to-4 Binary Decoder
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model


class Decoder2to4(model):
    """ 2-to-4 Binary Decoder """
    def __init__(self, A0, A1, Out0, Out1, Out2, Out3):
        self.A0 = dsignal(direction='in', port=A0)
        self.A1 = dsignal(direction='in', port=A1)

        self.Out0 = dsignal(direction='out', port=Out0)
        self.Out1 = dsignal(direction='out', port=Out1)
        self.Out2 = dsignal(direction='out', port=Out2)
        self.Out3 = dsignal(direction='out', port=Out3)

    def digital(self):
        """ Perform decoding """
        a0 = self.A0
        a1 = self.A1
        self.Out0 += ~a1 & ~a0
        self.Out1 += ~a1 & a0
        self.Out2 += a1 & ~a0
        self.Out3 += a1 & a0