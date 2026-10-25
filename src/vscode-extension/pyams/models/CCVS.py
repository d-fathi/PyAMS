#-------------------------------------------------------------------------------
# Name:        CCVS (current-controlled voltage source, SPICE "H")
# Created:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import voltage, current


# Current-Controlled Voltage Source --------------------------------------------
class CCVS(model):
    """
    Current-controlled voltage source (SPICE "H" element, a transresistance):

        v(p) - v(n) = Rm * Ic

    Ic is the current that flows through the control branch from cp to cn.  The
    control branch is built into the element: it is a zero-volt source, an
    ideal ammeter, so connect (cp, cn) IN SERIES with the branch whose current
    controls the source (the current enters at cp and leaves at cn).

    Typical uses: a current-to-voltage (transimpedance) converter, a gyrator,
    the primary-current sensing half of an ideal transformer.

    Terminals: CCVS(p, n, cp, cn).

    Attributes:
        Vs (signal): the 0 V sensing branch between cp and cn.
        Ic (signal): its current, from cp to cn.
        V  (signal): output voltage v(p) - v(n).
        Rm (param): transresistance in ohms (default 1 kΩ).
    """
    def __init__(self, p, n, cp, cn):
        self.Vs = signal('out', voltage, cp, cn)       # zero-volt ammeter
        self.Ic = signal('in', current, cp, cn)
        self.V = signal('out', voltage, p, n)

        self.Rm = param(1.0e3, 'Ω', 'Transresistance')

    def analog(self):
        self.Vs += 0.0
        self.V += self.Rm * self.Ic
