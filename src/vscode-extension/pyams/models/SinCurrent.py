#-------------------------------------------------------------------------------
# Name:        SinCurrent (sinusoidal current source)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model, time
from pyams.lib import current
from math import sin, pi


# Sine Wave Current Source Model -----------------------------------------------
class SinCurrent(model):
    """
    This class models a Sinusoidal Current Source.

    The current waveform follows the equation:
        I(t) = Ia * sin(2π * Fr * t + Ph) + Ioff

    A positive current flows through the source from node p to node n
    (SPICE convention, see DCCurrent).

    Attributes:
        I (signal): Current through the source, from p to n.
        Fr (param): Frequency of the sine wave (Hz).
        Ia (param): Amplitude of the sine wave (A).
        Ph (param): Phase shift in degrees (°).
        Ioff (param): Current offset (A).

    Methods:
        analog(): Implements the sinusoidal current equation.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.Fr = param(100.0, 'Hz', 'Frequency of sine wave')
        self.Ia = param(1e-3, 'A', 'Amplitude of sine wave')
        self.Ph = param(0.0, '°', 'Phase of sine wave')
        self.Ioff = param(0.0, 'A', 'Current offset')

    def analog(self):
        """Implements the sinusoidal current equation."""
        self.I += self.Ia * sin(2 * pi * self.Fr * time
                                + (self.Ph * pi / 180.0)) + self.Ioff
