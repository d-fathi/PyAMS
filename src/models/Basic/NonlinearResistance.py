#-------------------------------------------------------------------------------
# Name:        Non linear resistance
# Author:      PyAMS
# Created:     20/08/2020
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#--------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage, current

# Nonlinear Resistance Model
class NonlinearResistance(model):
    """
    This class implements a Nonlinear Resistance model.

    A nonlinear resistor exhibits a current-voltage relationship that is not
    governed by Ohm's law. Instead, the current depends on a nonlinear function
    of voltage.

    Attributes:
        V (signal): Input voltage signal across the nonlinear resistor, defined between nodes (p, n).
        I (signal): Output current signal through the nonlinear resistor, defined between nodes (p, n).
        µ (param): Scalar multiplier for nonlinearity, default is 1.0.

    Methods:
        analog(): Defines the nonlinear current-voltage relationship:
                  I = µ * V * (V² - 1)
    """

    def __init__(self, p, n):
        # Signal declarations
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.µ = param(1.0, ' ', 'Scalar of nonlinearity')

    def analog(self):
        """Defines the nonlinear current-voltage relationship."""
        self.I += self.µ * self.V * (self.V * self.V - 1)



