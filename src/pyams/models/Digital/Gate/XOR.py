#-------------------------------------------------------------------------------
# Name:        XOR
# Author:      Dhiabi Fathi
# Created:     02/05/2025
# Modified:    07/06/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model, circuit

class XOR(model):
    """ Digital XOR gate model """
    def __init__(self, In1, In2, Out):
        # Digital Signal declarations
        self.In1 = dsignal(direction='in', port=In1)
        self.In2 = dsignal(direction='in', port=In2)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform XOR operation """
        self.Out += self.In1 ^ self.In2



