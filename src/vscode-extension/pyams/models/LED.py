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
    Light emitting diode: a diode (Shockley equation) given by its forward
    voltage Vf at the current If, plus the parameter `lit` for the live
    polygon of the symbol.

        a (anode) ---|>|--- k (cathode)

    The LED needs a series resistor (a diode alone has no current limit).

    Terminals: LED(a, k)
    Parameters:
        Vf    forward voltage at the current If (V)         1.9  (red)
        If    current at which the forward voltage is Vf    10e-3
        n     ideality factor                               2
        Vt    thermal voltage (V)                           0.025
        Iref  current of a fully lit LED (A)                5e-3
        lit   brightness 0 ... 1 = I / Iref, written by live() for the live
              polygon of the symbol (it lights up when lit >= 0.5)

    Typical Vf: red 1.9 V, yellow 2.1 V, green 2.2 V, blue 3.0 V
    (the symbols LED Red, LED Yellow, LED Green and LED Blue set it).
    """
    def __init__(self, a, k):
        self.V = signal('in', voltage, a, k)
        self.I = signal('out', current, a, k)
        self.Vf = param(1.9, 'V', 'Forward voltage at the current If')
        self.If = param(10.0e-3, 'A', 'Current at which the forward voltage is Vf')
        self.n = param(2.0, ' ', 'Ideality factor')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Iref = param(5.0e-3, 'A', 'Current of a fully lit LED')
        self.lit = param(0.0, ' ', 'Brightness 0 ... 1 (output for the live polygon)')

    def analog(self):
        nVt = self.n * self.Vt
        self.I += self.If * exp(-self.Vf / nVt) * (exp(self.V / nVt) - 1)

    def live(self):
        """Called after every accepted step: brightness shown by the live polygon."""
        self.lit = min(1.0, max(0.0, self.I / self.Iref))
