#-------------------------------------------------------------------------------
# Name:        Relay (changeover relay) - project model for the Live simulation
# Updated:     13/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time


class Relay(model):
    """
    Electromechanical relay with a changeover contact (SPDT).

    Terminals (cp, cn, com, no, nc): coil +, coil -, common, normally open, normally closed.

    The coil is a resistor Rc (with a small capacitance Cc).  The relay pulls in when the coil
    voltage rises above Von and drops out when it falls below Voff (Voff < Von gives the usual
    hysteresis).  While it is pulled in, com is joined to no (resistance Ron) and disconnected from nc
    (Roff); at rest it is the other way round.  The state changes only when a time point is
    accepted, like in the Comparator model.

    live() writes the state to the parameter `act` (1 = pulled in) for the widgets of the symbol
    (the Automatic transfer switch and the coil LED).
    """
    def __init__(self, cp, cn, com, no, nc):
        self.Vc = signal('in', voltage, cp, cn)
        self.Ic = signal('out', current, cp, cn)
        self.Vno = signal('in', voltage, com, no)
        self.Ino = signal('out', current, com, no)
        self.Vnc = signal('in', voltage, com, nc)
        self.Inc = signal('out', current, com, nc)

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
        cd = ddt(self.Vc)                       # keeps the element stateful (see Comparator)
        if accepting():                         # a time point has been accepted
            if float(time) <= 0.0:              # a new run starts
                self._on = None
            if self._on is None:
                self._on = vc >= self.Von
            elif self._on:
                if vc < self.Voff:
                    self._on = False
            elif vc > self.Von:
                self._on = True
            return
        on = bool(self._on)
        self.Ic += vc / self.Rc + self.Cc * cd
        self.Ino += self.Vno / (self.Ron if on else self.Roff)
        self.Inc += self.Vnc / (self.Roff if on else self.Ron)

    def live(self):
        self.act = 1.0 if self._on else 0.0
