#-------------------------------------------------------------------------------
# Name:        VCCS
# Author:      d.fathi
# Created:     10/03/2017
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage, current

# Voltage-Controlled Current Source (VCCS) Model
class VCCS(model):
    """
    This class models a Voltage-Controlled Current Source (VCCS).

    The output current (Iout) is proportional to the input voltage (Vin) 
    based on a transconductance gain (G):

        Iout = G * Vin

    Where:
    - Vin: Input voltage across terminals (p1, n1)
    - Iout: Output current through terminals (p2, n2)
    - G: Transconductance gain (default: 1)

    Attributes:
        Vin (signal): Input voltage.
        Iout (signal): Output current.
        G (param): Transconductance gain multiplier.

    Methods:
        analog(): Defines the voltage-current relationship.
    """

    def __init__(self, p1, n1, p2, n2):
        # Signal declarations
        self.Vin = signal('in', voltage, p1, n1)
        self.Iout = signal('out', current, p2, n2)

        # Parameter declarations
        self.G = param(1.0, '1/Ω', 'Transconductance gain')

    def analog(self):
        """Defines the voltage-controlled current source equation."""
        self.Iout += self.G * self.Vin  # Iout = G * Vin



