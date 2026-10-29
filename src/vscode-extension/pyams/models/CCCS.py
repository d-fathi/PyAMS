#-------------------------------------------------------------------------------
# Name:        CCCS (current-controlled current source, SPICE "F")
# Updated:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import voltage, current


# Current-Controlled Current Source --------------------------------------------
class CCCS(model):
    """
    Current-controlled current source (SPICE "F" element, a current mirror /
    current amplifier):

        i(p -> n) = Gain * Ic

    Ic is the current that flows through the control branch from cp to cn.  The
    control branch is built into the element: it is a zero-volt source, an
    ideal ammeter, so connect (cp, cn) IN SERIES with the branch whose current
    controls the source (the current enters at cp and leaves at cn).  The
    output current Gain*Ic flows through the source from p to n.

    Typical uses: the beta*ib generator of a transistor model, an ideal current
    mirror, the primary current of an ideal transformer.

    Terminals: CCCS(p, n, cp, cn).

    Attributes:
        Vs (signal): the 0 V sensing branch between cp and cn.
        Ic (signal): its current, from cp to cn.
        I  (signal): output current from p to n.
        Gain (param): current gain, A/A (default 1).
    """
    def __init__(self, p, n, cp, cn):
        self.Vs = signal('out', voltage, cp, cn)       # zero-volt ammeter
        self.Ic = signal('in', current, cp, cn)
        self.I = signal('out', current, p, n)

        self.Gain = param(1.0, 'A/A', 'Current gain')

    def analog(self):
        self.Vs += 0.0
        self.I += self.Gain * self.Ic
