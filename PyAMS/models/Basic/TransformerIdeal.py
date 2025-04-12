#-------------------------------------------------------------------------------
# Name:        Transformer Ideal
# Author:      Dhiabi Fathi
# Created:     20/04/2022
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#https://electronics.stackexchange.com/questions/418003/ideal-dc-transformer-in-ltspice
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage, current

# Ideal Transformer Model
class TransformerIdeal(model):
    """
    This class models an Ideal Transformer using behavioral modeling.

    The transformer follows the ideal transformer equations:

        Vs = Vp / N  (Voltage transformation)
        Ip = Is / N  (Current transformation)

    Where:
    - Vs: Secondary voltage
    - Vp: Primary voltage
    - Is: Secondary current
    - Ip: Primary current
    - N: Turns ratio

    Attributes:
        Vp (signal): Primary voltage input.
        Ip (signal): Primary current output.
        Vs (signal): Secondary voltage output.
        Is (signal): Secondary current input.
        N (param): Turns ratio (default: 7.0).

    Methods:
        analog(): Defines the voltage and current relationships of an ideal transformer.
    """

    def __init__(self, p1, n1, p2, n2):
        # Signal declarations
        self.Vp = signal('in', voltage, p1, n1)
        self.Ip = signal('out', current, p1, n1)
        self.Vs = signal('out', voltage, p2, n2)
        self.Is = signal('in', current, p2, n2)

        # Parameter declarations
        self.N = param(7.0, '', 'Winding ratio')

    def analog(self):
        """Defines the voltage and current relationships of an ideal transformer."""
        self.Vs += self.Vp / self.N  # Voltage transformation equation
        self.Ip += self.Is / self.N  # Current transformation equation

