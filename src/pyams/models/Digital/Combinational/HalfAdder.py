#-------------------------------------------------------------------------------
# Name:        Digital half adder model
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model

class HalfAdder(model):
    """ Digital half adder model """
    def __init__(self, A, B, S, C):
        self.A = dsignal(direction='in', port=A)
        self.B = dsignal(direction='in', port=B)
        self.S = dsignal(direction='out', port=S)
        self.C = dsignal(direction='out', port=C)

    def digital(self):
        """ Perform half-adder logic """
        self.S += self.A ^ self.B
        self.C += self.A & self.B