#-------------------------------------------------------------------------------
# Name:        AND
# Author:      Dhiabi Fathi
# Created:     02/05/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model,circuit

# Create digital models---------------------------------------------------------
class AND(model):
    """ Digital AND gate model """
    def __init__(self, In1, In2, Out):
        self.In1 = dsignal(direction='in', port=In1)
        self.In2 = dsignal(direction='in', port=In2)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform AND operation """
        self.Out += self.In1 & self.In2
