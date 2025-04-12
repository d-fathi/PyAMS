#-------------------------------------------------------------------------------
# Name:        Square voltage Source
# Author:      d.fathi
# Created:     14/03/2017
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param, time
from pyams_lib import voltage

# Square Voltage Source Model--------------------------------------------------
class SquareVoltage(model):
    """
    This class models a Square Wave Voltage Source.

    The voltage waveform alternates between two levels every half-period (T/2):

        V(t) = Va + Voff  (for 0 ≤ t < T/2)
        V(t) = Voff       (for T/2 ≤ t < T)

    Where:
    - Va: Amplitude of square wave voltage
    - Voff: Offset voltage
    - T: Period of the waveform

    Attributes:
        V (signal): Output voltage.
        Va (param): Amplitude of the square wave voltage.
        T (param): Period of the waveform.
        Voff (param): Offset voltage.

    Methods:
        analog(): Defines the square wave voltage output.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.V = signal('out', voltage, p, n)

        # Parameter declarations
        self.Va = param(1.0, 'V', 'Amplitude of square wave voltage')
        self.T = param(0.1, 'Sec', 'Period')
        self.Voff = param(0.0, 'V', 'Offset voltage')

    def analog(self):
        """Defines the square wave voltage equation."""
        t = time  # Get the current simulation time
        cycle_time = t % self.T  # Time within the current period

        if cycle_time < (self.T / 2):
            self.V += self.Va + self.Voff  # High state
        else:
            self.V += self.Voff  # Low state





