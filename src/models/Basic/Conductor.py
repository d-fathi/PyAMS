#-------------------------------------------------------------------------------
# Name:        Conductor
# Author:      d.fathi
# Created:     06/03/2017
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#--------------------------------------------------------------------------------


from pyams_lib import model, signal, param
from pyams_lib import voltage, current

# Ideal Linear Electrical Conductor Model
class Conductor(model):
    """
    This class implements an Ideal Linear Electrical Conductor model.

    A conductor is characterized by its conductance (G), which is the reciprocal 
    of resistance (R). The current flowing through the conductor is proportional 
    to the applied voltage according to Ohm's Law.

    Attributes:
        V (signal): Input voltage signal across the conductor, defined between nodes (p, n).
        I (signal): Output current signal through the conductor, defined between nodes (p, n).
        G (param): Conductance value in Siemens (S), default is 1.0 S (1/Ω).

    Methods:
        analog(): Defines the current-voltage relationship:
                  I = G * V
    """
    
    def __init__(self, p, n):
        # Signal declarations
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.G = param(1.0, '1/Ω', 'Conductance value')

    def analog(self):
        """Defines the conductor behavior where current is proportional to voltage."""
        self.I += self.V * self.G
