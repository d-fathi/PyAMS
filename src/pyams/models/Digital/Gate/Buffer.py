#-------------------------------------------------------------------------------
# Name:        Buffer
# Author:      Dhiabi Fathi
# Created:     02/05/2025
# Modified:    07/06/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model, circuit

class Buffer(model):
    """ Digital buffer model """
    def __init__(self, In, Out):
        # Digital Signal declarations
        self.In = dsignal(direction='in', port=In)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform buffer operation """
        self.Out += self.In
