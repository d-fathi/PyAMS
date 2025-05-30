#-------------------------------------------------------------------------------
# Name:        3-to-8 Binary Decoder
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------


from pyams.lib import dsignal, model


class Decoder3to8(model):
    """ 3-to-8 Binary Decoder """
    def __init__(self, A0, A1, A2, Out0, Out1, Out2, Out3, Out4, Out5, Out6, Out7):
        self.A0 = dsignal(direction='in', port=A0)
        self.A1 = dsignal(direction='in', port=A1)
        self.A2 = dsignal(direction='in', port=A2)

        self.Out0 = dsignal(direction='out', port=Out0)
        self.Out1 = dsignal(direction='out', port=Out1)
        self.Out2 = dsignal(direction='out', port=Out2)
        self.Out3 = dsignal(direction='out', port=Out3)
        self.Out4 = dsignal(direction='out', port=Out4)
        self.Out5 = dsignal(direction='out', port=Out5)
        self.Out6 = dsignal(direction='out', port=Out6)
        self.Out7 = dsignal(direction='out', port=Out7)

    def digital(self):
        """ Perform decoding """
        a0 = self.A0
        a1 = self.A1
        a2 = self.A2
        self.Out0 += ~a2 & ~a1 & ~a0
        self.Out1 += ~a2 & ~a1 & a0
        self.Out2 += ~a2 & a1 & ~a0
        self.Out3 += ~a2 & a1 & a0
        self.Out4 += a2 & ~a1 & ~a0
        self.Out5 += a2 & ~a1 & a0
        self.Out6 += a2 & a1 & ~a0
        self.Out7 += a2 & a1 & a0