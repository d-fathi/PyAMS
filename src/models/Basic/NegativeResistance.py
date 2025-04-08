#-------------------------------------------------------------------------------
# Name:        Negative resistance
# Author:      Dhiabi Fathi
# Created:     28/07/2020
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#--------------------------------------------------------------------------------


from pyams_lib import model, signal, param
from pyams_lib import voltage, current

# Negative Resistance Model
class NegativeResistance(model):
    """
    This class implements a Negative Resistance model.

    A negative resistance component exhibits behavior where an increase in 
    voltage results in a decrease in current, contrary to conventional resistors.

    Attributes:
        V (signal): Input voltage signal across the negative resistance, defined between nodes (p, n).
        I (signal): Output current signal through the negative resistance, defined between nodes (p, n).
        Gb (param): Conductance multiplier in 1/Ω, default is -1.0.
        Ga (param): Conductance multiplier in 1/Ω, default is -1.0.
        Ve (param): Threshold voltage (V) for changing conductance behavior, default is 1.0V.

    Methods:
        analog(): Defines the current-voltage relationship based on three cases:
                  - If V < -Ve: I = Gb * (V + Ve) - Ga * Ve
                  - If V > Ve: I = Gb * (V - Ve) + Ga * Ve
                  - Otherwise: I = Ga * V
    """
    
    def __init__(self, p, n):
        # Signal declarations
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.Gb = param(-1.0, '1/Ω', 'Conductance multiplier')
        self.Ga = param(-1.0, '1/Ω', 'Conductance multiplier')
        self.Ve = param(1.0, 'V', 'Voltage')

    def analog(self):
        """Defines the current-voltage relationship for negative resistance."""
        if self.V < -self.Ve:
            self.I += self.Gb * (self.V + self.Ve) - self.Ga * self.Ve
        elif self.V > self.Ve:
            self.I += self.Gb * (self.V - self.Ve) + self.Ga * self.Ve
        else:
            self.I += self.Ga * self.V


