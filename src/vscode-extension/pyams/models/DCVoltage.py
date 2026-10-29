#-------------------------------------------------------------------------------
# Name:        DCVoltage (constant voltage source)
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import voltage


# DC Voltage Source Model ----------------------------------------------------------
class DCVoltage(model):
    """
    This class models a constant (DC) voltage source.

    The voltage is  V = Vdc  at all times, so it is also the supply of
    circuits that need a fixed rail (a battery, Vcc, a bias voltage).

    Attributes:
        V (signal): Output voltage between nodes (p, n); p is the + terminal.
        Vdc (param): Voltage value in Volts (V), default is 5.0 V.

    Methods:
        analog(): Implements the equation V = Vdc.
    """
    def __init__(self, p, n):
        # Signal declaration
        self.V = signal('out', voltage, p, n)

        # Parameter declaration
        self.Vdc = param(5.0, 'V', 'Constant voltage value')

    def analog(self):
        """Implements the constant voltage equation."""
        self.V += self.Vdc
