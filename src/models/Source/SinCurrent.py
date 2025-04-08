#-------------------------------------------------------------------------------
# Name:        Sine wave Voltage
# Author:      D.Fathi
# Created:     20/03/2015
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from pyams_lib import signal, param, model, time
from pyams_lib import current
from math import sin, pi

# Sine Wave Current Source Model -----------------------------------------------
class SinCurrent(model):
    """
    This class models a Sinusoidal Current Source.

    The current waveform follows the equation:
        I(t) = Ia * sin(2π * Fr * t + Ph) + Ioff

    Attributes:
        I (signal): Output current.
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
        self.Ia = param(1.0, 'A', 'Amplitude of sine wave')
        self.Ph = param(0.0, '°', 'Phase of sine wave')
        self.Ioff = param(0.0, 'A', 'Current offset')

    def analog(self):
        """Implements the sinusoidal current equation."""
        self.I += self.Ia * sin(2 * pi * self.Fr * time + (self.Ph * pi / 180.0)) + self.Ioff
