#-------------------------------------------------------------------------------
# Name:        Vdc Source
# Author:      D.fathi
# Created:     20/03/2015
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free GPLv3
#-------------------------------------------------------------------------------


from pyams_lib import signal, param, model
from pyams_lib import voltage

# DC Voltage Source Model------------------------------------------------------
class DCVoltage(model):
    """
    This class models a DC Voltage Source that provides a constant voltage.

    The output voltage (V) remains fixed at a specified value (Vdc), independent 
    of current or other circuit conditions:

        V = Vdc

    Where:
    - V: Output voltage across terminals (p, n)
    - Vdc: Constant DC voltage value (default: 15V)

    Attributes:
        V (signal): Output voltage.
        Vdc (param): Constant voltage value.

    Methods:
        analog(): Defines the constant voltage output.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.V = signal('out', voltage, p, n)

        # Parameter declaration
        self.Vdc = param(15.0, 'V', 'Value of constant voltage')

    def analog(self):
        """Defines the constant voltage output equation."""
        self.V += self.Vdc  # V = Vdc


