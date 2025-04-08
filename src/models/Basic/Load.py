#----------------------------------------------------
# Name:        Load
# Author:      d.fathi
# Created:     05/01/2015
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#------------------------------------------------------

from pyams_lib import signal, model, param
from pyams_lib import voltage, current

# Load Model
class Load(model):
    """
    This class implements a Load model.

    The Load model represents a resistive load in an electrical circuit, 
    where the voltage across the load is proportional to the current through it 
    based on the resistance value. Additionally, power dissipation is calculated.

    Attributes:
        V (signal): Output voltage signal across the load, defined between nodes (p, n).
        I (signal): Input current signal through the load, defined between nodes (p, n).
        R (param): Resistance value in Ohms (Ω), default is 100 Ω.
        P (param): Power dissipation in Watts (W), calculated as P = V * I.

    Methods:
        analog(): Defines the voltage-current relationship using Ohm's Law:
                  V = R * I
                  P = V * I
    """
    
    def __init__(self, p, n):
        # Signal declarations
        self.V = signal('out', voltage, p, n)
        self.I = signal('in', current, p, n)
        # Parameter declarations
        self.R = param(100, 'Ω', 'Resistive')
        # Local parameter for power calculation
        self.P = param(unit='W', description='Power')

    def analog(self):
        """Defines the load's voltage-current relationship and power dissipation."""
        # V = R * I (Ohm's Law)
        self.V += self.R * self.I

        # Power calculation: P = V * I
        self.P += self.V * self.I
