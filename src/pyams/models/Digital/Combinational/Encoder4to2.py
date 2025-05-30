#-------------------------------------------------------------------------------
# Name:        4-to-2 Priority Encoder
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model

class Encoder4to2(model):
    """ 4-to-2 Priority Encoder """
    def __init__(self, In0, In1, In2, In3, Out0, Out1, Valid):
        self.In0 = dsignal(direction='in', port=In0)
        self.In1 = dsignal(direction='in', port=In1)
        self.In2 = dsignal(direction='in', port=In2)
        self.In3 = dsignal(direction='in', port=In3)

        self.Out0 = dsignal(direction='out', port=Out0)
        self.Out1 = dsignal(direction='out', port=Out1)
        self.Valid = dsignal(direction='out', port=Valid)

    def digital(self):
        """ Perform priority encoding """
        i0, i1, i2, i3 = self.In0, self.In1, self.In2, self.In3
        self.Valid += i0 | i1 | i2 | i3
        self.Out1 += i2 | i3
        self.Out0 += i1 | i3