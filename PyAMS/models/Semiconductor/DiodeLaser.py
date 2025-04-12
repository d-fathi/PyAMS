#-------------------------------------------------------------------------------
# Name:        Simple Diode Laser
# Author:      d.fathi
# Created:     20/10/2024
# Modified:    28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal,model,param
from pyams_lib import voltage,current
from pyams_lib import explim,ddt

class DiodeLaser(model):
    """
    This class implements a Diode Laser model.

    A diode laser is a semiconductor device that generates coherent light based on the
    interaction between electrical current and the active laser medium.

    Attributes:
        V (signal): Input voltage signal across the diode laser, defined between nodes (p, n).
        I (signal): Output current signal through the diode laser, defined between nodes (p, n).
        Iss (param): Saturation current (default: 1.0e-15 A), representing the small leakage
                     current in reverse bias.
        Vt (param): Thermal voltage (default: 0.025 V), depending on temperature.
        n (param): Ideality factor (default: 1), representing how closely the diode follows
                   the ideal diode equation.
        Rth (param): Thermal resistance (default: 10 Ω), modeling heat dissipation.
        Cj (param): Junction capacitance (default: 1e-9 F), representing charge storage effects.

    Methods:
        analog(): Defines the diode laser behavior using a combination of the Shockley equation,
                  thermal resistance, and junction capacitance effects:
                  I = Iss * (exp(V / (n * Vt)) - 1) + Rth * V + Cj * ddt(V)
    """
    def __init__(self, p, n):
        # Signals declarations------------------------------------------------
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # Parameters declarations----------------------------------------------
        self.Iss = param(1.0e-15, 'A', 'Saturation current')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.n = param(1, ' ', 'The ideality factor')
        self.Rth = param(10, 'Ω', 'Thermal resistance between anode and cathode')
        self.Cj = param(1e-9, 'F', 'Junction capacitance between anode and cathode')

    def analog(self):
        """Defines the diode laser's current-voltage relationship."""
        self.I += self.Iss * (explim(self.V / (self.n * self.Vt)) - 1) + self.Rth * self.V + self.Cj * ddt(self.V)
