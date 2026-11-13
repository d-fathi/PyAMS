#-------------------------------------------------------------------------------
# Name:        RelayNO (relay with one normally open contact) - Live simulation demo
# Updated:     13/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time


class RelayNO(model):
    """
    Relay with one normally open contact (SPST-NO).  Terminals (cp, cn, a, b): coil +, coil -,
    the two contact terminals.  Same behaviour as Relay (pull-in Von, drop-out Voff);
    live() writes the state to the parameter `act` for the Automatic switch of the symbol.
    """
    def __init__(self, cp, cn, a, b):
        self.Vc = signal('in', voltage, cp, cn)
        self.Ic = signal('out', current, cp, cn)
        self.Vk = signal('in', voltage, a, b)
        self.Ik = signal('out', current, a, b)

        self.Rc = param(240.0, 'Ω', 'Coil resistance')
        self.Cc = param(1e-9, 'F', 'Coil capacitance')
        self.Von = param(6.0, 'V', 'Pull-in voltage')
        self.Voff = param(2.0, 'V', 'Drop-out voltage')
        self.Ron = param(0.05, 'Ω', 'Closed contact resistance')
        self.Roff = param(1e9, 'Ω', 'Open contact resistance')
        self.act = param(0.0, '', 'State: 1 = pulled in (written by live())')
        self._on = None

    def analog(self):
        vc = self.Vc
        cd = ddt(self.Vc)
        if accepting():
            if float(time) <= 0.0:
                self._on = None
            if self._on is None:
                self._on = vc >= self.Von
            elif self._on:
                if vc < self.Voff:
                    self._on = False
            elif vc > self.Von:
                self._on = True
            return
        self.Ic += vc / self.Rc + self.Cc * cd
        self.Ik += self.Vk / (self.Ron if self._on else self.Roff)

    def live(self):
        self.act = 1.0 if self._on else 0.0
