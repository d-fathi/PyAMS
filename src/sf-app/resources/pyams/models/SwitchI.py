#-------------------------------------------------------------------------------
# Name:        SwitchI (current-controlled switch, SPICE "W")
# Author:      d.fathi
# Created:     15/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from math import tanh, log, exp
from pyams.lib import model, signal, param, voltage, current


class SwitchI(model):
    """
    Current-controlled switch (SPICE "W" element): closed (resistance Ron) when
    the control current Ic is above the threshold It, open (resistance Roff)
    otherwise.

        p ----o   o---- n           Ic = current through (cp -> cn)
               \\
                 Ic

    Ic is the current that flows through the control branch from cp to cn.  The
    control branch is built into the element: it is a zero-volt source, an ideal
    ammeter, so connect (cp, cn) IN SERIES with the branch whose current controls
    the switch (the current enters at cp and leaves at cn), exactly like the
    control branch of a CCCS.

    To keep Newton's method and the time step well behaved the change from Roff
    to Ron is not an instantaneous jump but a very steep smooth transition of
    width Iw around It (the conductance is interpolated on a logarithmic scale):

        s = 0.5 (1 + tanh((Ic - It) / Iw))            0 = open, 1 = closed
        G = Goff^(1 - s) * Gon^s ,   I = G (V(p) - V(n)),   Gon = 1/Ron, Goff = 1/Roff

    Outside |Ic - It| > 5 Iw the switch is closed or open to better than 0.01 %.

    Terminals: SwitchI(p, n, cp, cn)
    Parameters:
        It    threshold current (A)                       1e-3
        Iw    width of the transition (A), small = abrupt   1e-6
        Ron   closed resistance (ohm)                     1e-3
        Roff  open resistance (ohm)                       1e9

    Live simulation:  live() writes the state to the parameter `act` (1 = closed,
    i.e. Ic >= It) for the widgets of the symbol (Automatic switch).  It is only
    called by the Live simulation and does not change any other analysis.
    """
    def __init__(self, p, n, cp, cn):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        self.Vs = signal('out', voltage, cp, cn)        # zero-volt ammeter of the control branch
        self.Ic = signal('in', current, cp, cn)
        self.It = param(1e-3, 'A', 'Threshold of the control current')
        self.Iw = param(1e-6, 'A', 'Width of the smooth transition')
        self.Ron = param(1e-3, 'Ω', 'Closed resistance')
        self.Roff = param(1e9, 'Ω', 'Open resistance')
        self.act = param(0.0, '', 'State for the Live widgets: 1 = closed (written by live())')

    def analog(self):
        self.Vs += 0.0
        x = (self.Ic - self.It) / max(float(self.Iw), 1e-15)
        s = 0.5 * (1.0 + tanh(max(-30.0, min(30.0, x))))
        lg = (1.0 - s) * log(1.0 / self.Roff) + s * log(1.0 / self.Ron)
        self.I += exp(lg) * self.V

    def live(self):
        self.act = 1.0 if float(self.Ic) >= float(self.It) else 0.0
