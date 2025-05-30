#-------------------------------------------------------------------------------
# Name:        NAND
# Author:      D.Fathi
# Created:     06/05/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model,circuit

# Create digital models---------------------------------------------------------
class NAND(model):
    """ Digital NAND gate model """
    def __init__(self, In1, In2, Out):
        self.In1 = dsignal(direction='in', port=In1)
        self.In2 = dsignal(direction='in', port=In2)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform NAND operation """
        self.Out += ~(self.In1 & self.In2)


