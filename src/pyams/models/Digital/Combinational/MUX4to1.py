#-------------------------------------------------------------------------------
# Name:        4-to-1 Multiplexer
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------


from pyams.lib import dsignal, model

class MUX4to1(model):
    """ 4-to-1 Multiplexer """
    def __init__(self, In0, In1, In2, In3, Sel0, Sel1, Out):
        self.In0 = dsignal(direction='in', port=In0)
        self.In1 = dsignal(direction='in', port=In1)
        self.In2 = dsignal(direction='in', port=In2)
        self.In3 = dsignal(direction='in', port=In3)
        self.Sel0 = dsignal(direction='in', port=Sel0)
        self.Sel1 = dsignal(direction='in', port=Sel1)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform 4-to-1 MUX logic """
        s0 = self.Sel0
        s1 = self.Sel1
        self.Out += (~s1 & ~s0 & self.In0) | \
                    (~s1 & s0 & self.In1) | \
                    (s1 & ~s0 & self.In2) | \
                    (s1 & s0 & self.In3)
