#-------------------------------------------------------------------------------
# Name:        Puls current Source
# Author:      d.fathi
# Created:     14/03/2017
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import model,signal,param, time
from pyams_lib import current

from pyams_lib import model, signal, param, time
from pyams_lib import current

# Pulse Current Source Model---------------------------------------------------
class PulsCurrent(model):
    """
    This class models a Pulsed Current Source that generates a square wave current.

    The current waveform is defined as:
    
        I(t) = Ia + Ioff  (for 0 ≤ t < D * T)
        I(t) = Ioff       (for D * T ≤ t < T)
    
    Where:
    - Ia: Amplitude of pulse current
    - Ioff: Offset current
    - T: Period of the waveform
    - D: Duty cycle (as a percentage)

    Attributes:
        I (signal): Output current.
        Ia (param): Amplitude of the pulse current.
        T (param): Period of the waveform.
        D (param): Duty cycle percentage.
        Ioff (param): Offset current.

    Methods:
        analog(): Defines the square wave current output.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.Ia = param(1.0, 'A', 'Amplitude of square wave current')
        self.T = param(0.1, 'Sec', 'Period')
        self.D = param(50, '%', 'Duty cycle')
        self.Ioff = param(0.0, 'A', 'Offset current')

    def analog(self):
        """Defines the square wave pulse current equation."""
        t = time  # Get the current simulation time
        cycle_time = t % self.T  # Time within the current period

        if cycle_time <= (self.D / 100.0) * self.T:
            self.I += self.Ia + self.Ioff  # Pulse ON
        else:
            self.I += self.Ioff  # Pulse OFF


