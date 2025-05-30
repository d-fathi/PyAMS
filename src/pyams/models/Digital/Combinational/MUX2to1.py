#-------------------------------------------------------------------------------
# Name:        2-to-1 Multiplexer
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model

class MUX2to1(model):
        """ 2-to-1 Multiplexer """
        def __init__(self, In0, In1, Sel, Out):
            self.In0 = dsignal(direction='in', port=In0)
            self.In1 = dsignal(direction='in', port=In1)
            self.Sel = dsignal(direction='in', port=Sel)
            self.Out = dsignal(direction='out', port=Out)

        def digital(self):
            """ Perform MUX logic """
            self.Out += (~self.Sel & self.In0) | (self.Sel & self.In1)