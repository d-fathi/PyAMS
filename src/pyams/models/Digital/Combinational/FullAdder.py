#-------------------------------------------------------------------------------
# Name:        Digital full adder model
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model

class FullAdder(model):
    """ Digital full adder model """
    def __init__(self, A, B, Cin, S, Cout):
        self.A = dsignal(direction='in', port=A)
        self.B = dsignal(direction='in', port=B)
        self.Cin = dsignal(direction='in', port=Cin)
        self.S = dsignal(direction='out', port=S)
        self.Cout = dsignal(direction='out', port=Cout)

    def digital(self):
        """ Perform full-adder logic """
        AxorB = self.A ^ self.B
        self.S += AxorB ^ self.Cin
        self.Cout += (self.A & self.B) | (self.Cin & AxorB)