#-------------------------------------------------------------------------------
# Name:        puls voltage Source
# Author:      d.fathi
# Created:     14/03/2017
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param, time
from pyams_lib import voltage

# Pulse Voltage Source Model---------------------------------------------------
class PulsVoltage(model):
    """
    This class models a Pulsed Voltage Source that generates a square wave voltage.

    The voltage waveform is defined as:
    
        V(t) = Va + Voff  (for 0 ≤ t < D * T)
        V(t) = Voff       (for D * T ≤ t < T)
    
    Where:
    - Va: Amplitude of pulse voltage
    - Voff: Offset voltage
    - T: Period of the waveform
    - D: Duty cycle (as a percentage)

    Attributes:
        V (signal): Output voltage.
        Va (param): Amplitude of the pulse voltage.
        T (param): Period of the waveform.
        D (param): Duty cycle percentage.
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
        self.D = param(50, '%', 'Duty cycle')
        self.Voff = param(0.0, 'V', 'Offset voltage')

    def analog(self):
        """Defines the square wave pulse voltage equation."""
        t = time.value  # Get the current simulation time
        cycle_time = t % self.T  # Time within the current period

        if cycle_time <= (self.D / 100.0) * self.T:
            self.V += self.Va + self.Voff  # Pulse ON
        else:
            self.V += self.Voff  # Pulse OFF


