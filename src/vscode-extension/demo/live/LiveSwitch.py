#-------------------------------------------------------------------------------
# Name:        LiveSwitch (a switch operated by a widget) - Live simulation demo
# Updated:     13/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current


class LiveSwitch(model):
    """
    Switch between a and b: closed (Ron) when `on` >= 0.5, open (Roff) otherwise.
    The parameter `on` is bound to an input widget (switch, push switch ...) in LiveSwitch.sym.
    """
    def __init__(self, a, b):
        self.V = signal('in', voltage, a, b)
        self.I = signal('out', current, a, b)
        self.on = param(0.0, '', 'Closed (1) / open (0)')
        self.Ron = param(0.01, 'Ω', 'Closed resistance')
        self.Roff = param(1e9, 'Ω', 'Open resistance')

    def analog(self):
        self.I += self.V / (self.Ron if self.on >= 0.5 else self.Roff)
