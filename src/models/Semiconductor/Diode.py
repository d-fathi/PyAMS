#-------------------------------------------------------------------------------
# Name:        Simple Diode
# Author:      d.fathi
# Created:     05/01/2015
# Modified:    28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal, model, param
from pyams_lib import voltage, current
from pyams_lib import explim

# Simple Diode Model-----------------------------------------------------------
class Diode(model):
    """
    This class implements a simple Diode model.

    A diode is a semiconductor device that allows current to flow in one direction
    while blocking it in the reverse direction. It follows the Shockley diode equation
    to define its behavior.

    Attributes:
        V (signal): Input voltage signal across the diode, defined between nodes (p, n).
        I (signal): Output current signal through the diode, defined between nodes (p, n).
        Iss (param): Saturation current (default: 1.0e-15 A), representing the small leakage
                     current in reverse bias.
        Vt (param): Thermal voltage (default: 0.025 V), depending on temperature.
        n (param): Ideality factor (default: 1), representing how closely the diode follows
                   the ideal diode equation.

    Methods:
        analog(): Defines the diode behavior using the Shockley equation:
                  I = Iss * (exp(V / (n * Vt)) - 1)
    """
    def __init__(self, p, n):
        # Signals declarations------------------------------------------------
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # Parameters declarations----------------------------------------------
        self.Iss = param(1.0e-15, 'A', 'Saturation current')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.n = param(1, ' ', 'The ideality factor')

    def analog(self):
        """Defines the diode's current-voltage relationship using the Shockley equation."""
        self.I += self.Iss * (explim(self.V / (self.n * self.Vt)) - 1)
