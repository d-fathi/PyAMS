#-------------------------------------------------------------------------------
# Name:        NOT
# Author:      D.Fathi
# Created:     06/05/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model,circuit

# Create digital models---------------------------------------------------------
class NOT(model):
    """ Digital NOT gate model """
    def __init__(self, In, Out):
        self.In = dsignal(direction='in', port=In)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform NOT operation """
        self.Out += ~self.In

