#-------------------------------------------------------------------------------
# Name:        Simple Diode zener
# Author:      d.fathi
# Created:     22/12/2021
# Modified:    28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal,model,param
from pyams_lib import voltage,current
from pyams_lib import explim,ddt

# Simple Zener Diode Model------------------------------------------------------
class DiodeZener(model):
    """
    This class implements a Zener Diode model.

    A Zener diode allows current to flow in the forward direction like a standard diode
    but also permits current in the reverse direction when the voltage exceeds a certain
    breakdown voltage.

    Attributes:
        V (signal): Input voltage signal across the Zener diode, defined between nodes (p, n).
        I (signal): Output current signal through the Zener diode, defined between nodes (p, n).
        Iss (param): Saturation current (default: 1.0e-12 A), representing the small leakage
                     current in reverse bias.
        Vt (param): Thermal voltage (default: 0.025 V), depending on temperature.
        N (param): Forward emission coefficient (default: 1.0), affecting the diode equation.
        BV (param): Breakdown voltage (default: 10.0 V), determining when reverse conduction occurs.
        IBV (param): Breakdown current (default: 0.001 A), the current at breakdown voltage.

    Methods:
        analog(): Defines the Zener diode behavior using a combination of the Shockley equation
                  and reverse breakdown behavior:
                  I = Iss * (exp(V / Vt) - 1) + IBV * (exp(-(V + BV) / Vt) - 1) * -1
    """
    def __init__(self, p, n):
        # Signals declarations------------------------------------------------
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # Parameters declarations----------------------------------------------
        self.Iss = param(1.0e-12, 'A', 'Saturation current')
        self.Vt = param(0.025, ' ', 'Thermal voltage')
        self.N = param(1.0, ' ', 'Forward emission coefficient')
        self.BV = param(10.0, 'V', 'Breakdown voltage')
        self.IBV = param(0.001, 'A', 'Breakdown current')

    def analog(self):
        """Defines the Zener diode's current-voltage relationship."""
        Id = self.Iss * (explim(self.V / self.Vt) - 1)
        Ii = self.IBV * (explim(-(self.V + self.BV) / self.Vt) - 1) * -1
        self.I += Id + Ii
