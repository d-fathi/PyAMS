#-------------------------------------------------------------------------------
# Name:        Square current Source
# Author:      d.fathi
# Created:     14/03/2017
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param, time
from pyams_lib import current

# Square Current Source Model--------------------------------------------------
class SquareCurrent(model):
    """
    This class models a Square Wave Current Source.

    The current waveform alternates between two levels every half-period (T/2):

        I(t) = Ia + Ioff  (for 0 ≤ t < T/2)
        I(t) = Ioff       (for T/2 ≤ t < T)

    Where:
    - Ia: Amplitude of square wave current
    - Ioff: Offset current
    - T: Period of the waveform

    Attributes:
        I (signal): Output current.
        Ia (param): Amplitude of the square wave current.
        T (param): Period of the waveform.
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
        self.Ioff = param(0.0, 'A', 'Offset current')

    def analog(self):
        """Defines the square wave current equation."""
        t = time  # Get the current simulation time
        cycle_time = t % self.T  # Time within the current period

        if cycle_time < (self.T / 2):
            self.I += self.Ia + self.Ioff  # High state
        else:
            self.I += self.Ioff  # Low state
