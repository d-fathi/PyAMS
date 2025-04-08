#-------------------------------------------------------------------------------
# Name:        Sine wave Voltage
# Author:      D.Fathi
# Created:     20/03/2015
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal, param, model, time
from pyams_lib import voltage
from math import sin, pi

# Sine Wave Voltage Source Model -----------------------------------------------
class SinVoltage(model):
    """
    This class models a Sinusoidal Voltage Source.

    The voltage waveform follows the equation:
        V(t) = Va * sin(2π * Fr * t + Ph) + Voff

    Attributes:
        V (signal): Output voltage.
        Fr (param): Frequency of the sine wave (Hz).
        Va (param): Amplitude of the sine wave (V).
        Ph (param): Phase shift in degrees (°).
        Voff (param): Voltage offset (V).

    Methods:
        analog(): Implements the sinusoidal voltage equation.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.V = signal('out', voltage, p, n)

        # Parameter declarations
        self.Fr = param(100.0, 'Hz', 'Frequency of sine wave')
        self.Va = param(10.0, 'V', 'Amplitude of sine wave')
        self.Ph = param(0.0, '°', 'Phase of sine wave')
        self.Voff = param(0.0, 'V', 'Voltage offset')

    def analog(self):
        """Implements the sinusoidal voltage equation."""
        self.V += self.Va * sin(2 * pi * self.Fr * time + (self.Ph * pi / 180.0)) + self.Voff

