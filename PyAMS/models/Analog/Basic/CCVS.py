#-------------------------------------------------------------------------------
# Name:        CCVS
# Author:      d.fathi
# Created:     10/03/2017
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current

# Current-Controlled Voltage Source (CCVS) Model
class CCVS(model):
    """
    This class implements a Current-Controlled Voltage Source (CCVS) model.

    A CCVS is a dependent voltage source where the output voltage (Vout) 
    is proportional to the input current (Iin) with a gain factor G, which 
    represents an equivalent resistance (Ohm's Law).

    Attributes:
        Iin (signal): Input current signal that controls the voltage source, defined between nodes (p1, n1).
        Vout (signal): Output voltage signal generated by the source, defined between nodes (p2, n2).
        G (param): Gain multiplier in Ohms (Ω), default is 1.0 Ω.

    Methods:
        analog(): Defines the voltage transformation:
                  Vout = G * Iin
    """
    
    def __init__(self, p1, n1, p2, n2):
        # Signal declarations
        self.Iin = signal('in', current, p1, n1)
        self.Vout = signal('out', voltage, p2, n2)

        # Parameter declarations
        self.G = param(1.0, 'Ohm', 'Gain multiplier')

    def analog(self):
        """Defines the CCVS behavior where output voltage is a scaled version of input current."""
        self.Vout += self.G * self.Iin



