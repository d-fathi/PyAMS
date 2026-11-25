#-------------------------------------------------------------------------------
# Name:        LiveDemo (a source with live widgets)
# Updated:     01/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# A project model for the Live simulation.  The symbol (LiveDemo.sym) carries the
# widgets; every widget is bound to a parameter of this model:
#
#   INPUT widgets  (the user changes them while the simulation runs)
#       switch   -> on     1 = the source is on
#       slider   -> Vs     source voltage 0 ... 5 V
#       button   -> boost  held down: +Vboost volts
#
#   OUTPUT widgets (written by live(), read by the widgets)
#       LED (active low)      <- led    0 = lit (source is on), 1 = off
#       7-segment (hex)       <- seg    terminal voltage * 3, 0 ... 15
#       polygon (overload)    <- ovl    1 = the output current exceeds Imax
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import voltage, current


class LiveDemo(model):
    """
    A voltage source with an internal resistance Rs.

        Vsrc = on * (Vs + boost * Vboost)
        I    = (V - Vsrc) / Rs          (current into the + terminal, negative when it delivers)

    Attributes:
        V (signal): voltage between the terminals (p, n).
        I (signal): current into the terminal p.
        on, Vs, boost (param): inputs, normally driven by the widgets.
        Rs, Imax, Vboost (param): internal resistance, overload limit, boost voltage.
        led, seg, ovl (param): outputs, written by live() for the widgets.
    """
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        # inputs (widgets)
        self.on = param(1.0, '', 'Source on (1) / off (0)')
        self.Vs = param(3.0, 'V', 'Source voltage')
        self.boost = param(0.0, '', 'Boost pressed (1) / released (0)')
        # settings
        self.Rs = param(100.0, 'Ω', 'Internal resistance')
        self.Imax = param(1.5e-3, 'A', 'Overload current')
        self.Vboost = param(2.0, 'V', 'Extra voltage while boost is pressed')
        # outputs (widgets)
        self.led = param(1.0, '', 'LED, active low: 0 = lit')
        self.seg = param(0.0, '', 'Terminal voltage x 3 (0 ... 15)')
        self.ovl = param(0.0, '', 'Overload indicator')

    def analog(self):
        vsrc = self.on * (self.Vs + self.boost * self.Vboost)
        self.I += (self.V - vsrc) / self.Rs

    def live(self):
        """Called once per accepted step: computes the values shown by the output widgets."""
        self.led = 0.0 if self.on >= 0.5 else 1.0
        self.seg = float(min(15, max(0, round(self.V * 3.0))))
        self.ovl = 1.0 if abs(self.I) > self.Imax else 0.0
