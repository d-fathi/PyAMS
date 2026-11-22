#-------------------------------------------------------------------------------
# Name:        LED (light emitting diode with a live indicator)
# Author:      d.fathi
# Created:     22/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import signal, model, param
from pyams.lib import voltage, current
from math import exp


class LED(model):
    """
    Light emitting diode: a diode (Shockley equation) whose forward voltage is
    about 2 V at 10 mA, plus the parameter `lit` for the LED widget of the symbol.

        a (anode) ---|>|--- k (cathode)

    The model needs a series resistor (the diode alone has no current limit).

    Terminals: LED(a, k)
    Parameters:
        Iss   saturation current (A)                      1e-18
        n     ideality factor                             2
        Vt    thermal voltage (V)                         0.025
        Iref  current of a fully lit LED (A)              5e-3
        lit   brightness 0 ... 1 = I / Iref, written by live() for the LED widget
              (the widget of the symbol lights up when lit >= 0.5)
    """
    def __init__(self, a, k):
        self.V = signal('in', voltage, a, k)
        self.I = signal('out', current, a, k)
        self.Iss = param(1.0e-18, 'A', 'Saturation current')
        self.n = param(2.0, ' ', 'Ideality factor')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Iref = param(5.0e-3, 'A', 'Current of a fully lit LED')
        self.lit = param(0.0, ' ', 'Brightness 0 ... 1 (output for the LED widget)')

    def analog(self):
        self.I += self.Iss * (exp(self.V / (self.n * self.Vt)) - 1)

    def live(self):
        """Called after every accepted step: brightness shown by the LED widget."""
        self.lit = min(1.0, max(0.0, self.I / self.Iref))
