#-------------------------------------------------------------------------------
# Name:        Switch (voltage-controlled switch)
# Author:      d.fathi
# Created:     10/09/2020
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from math import tanh, log, exp
from pyams.lib import model, signal, param, voltage, current


class Switch(model):
    """
    Voltage-controlled switch: closed (resistance Ron) when the control voltage
    Vc = V(cp) - V(cn) is above the threshold Vt, open (resistance Roff) otherwise.

        p ----o   o---- n           Vc = V(cp, cn)
               \\
                 Vc

    To keep Newton's method and the time step well behaved the change from Roff
    to Ron is not an instantaneous jump but a very steep smooth transition of
    width Vw around Vt (the conductance is interpolated on a logarithmic scale):

        s = 0.5 (1 + tanh((Vc - Vt) / Vw))            0 = open, 1 = closed
        G = Goff^(1 - s) * Gon^s ,   I = G (V(p) - V(n)),   Gon = 1/Ron, Goff = 1/Roff

    Outside |Vc - Vt| > 5 Vw the switch is closed or open to better than 0.01 %.

    Terminals: Switch(p, n, cp, cn)
    Parameters:
        Vt    threshold voltage (V)                       0.5
        Vw    width of the transition (V), small = abrupt   1e-3
        Ron   closed resistance (ohm)                     1e-3
        Roff  open resistance (ohm)                       1e9
    """
    def __init__(self, p, n, cp, cn):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        self.Vc = signal('in', voltage, cp, cn)
        self.Vt = param(0.5, 'V', 'Threshold of the control voltage')
        self.Vw = param(1e-3, 'V', 'Width of the smooth transition')
        self.Ron = param(1e-3, 'Ω', 'Closed resistance')
        self.Roff = param(1e9, 'Ω', 'Open resistance')

    def analog(self):
        x = (self.Vc - self.Vt) / max(float(self.Vw), 1e-12)
        s = 0.5 * (1.0 + tanh(max(-30.0, min(30.0, x))))
        lg = (1.0 - s) * log(1.0 / self.Roff) + s * log(1.0 / self.Ron)
        self.I += exp(lg) * self.V
