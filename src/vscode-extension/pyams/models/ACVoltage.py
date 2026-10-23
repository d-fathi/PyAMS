#-------------------------------------------------------------------------------
# Name:        ACVoltage (voltage source with an AC small-signal stimulus)
# Created:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

import cmath
import math
from pyams.lib import signal, param, model
from pyams.lib import voltage


# AC Voltage Source Model ------------------------------------------------------
class ACVoltage(model):
    """
    Voltage source for the AC (small-signal frequency) analysis.

    In a DC or transient analysis it is a constant source  V = Vdc  (0 V by
    default, so the AC source is silent: it has no effect on the operating
    point).  In  ``analysis(mode="ac", ...)``  the circuit is linearised around
    its DC operating point and this source injects the phasor

        Vac * exp(j * Ph)

    at every frequency, so each node voltage of the result is directly the
    transfer function (with Vac = 1 V, the default).

    Attributes:
        V (signal): Output voltage between nodes (p, n); p is the + terminal.
        Vdc (param): DC value in Volts (default 0 V): the bias of the operating point.
        Vac (param): AC amplitude in Volts (default 1 V).
        Ph (param): AC phase in degrees (default 0).

    Methods:
        analog(): V = Vdc.
        ac(): the (signal name, phasor) pair used by the AC analysis.
    """
    def __init__(self, p, n):
        self.V = signal('out', voltage, p, n)

        self.Vdc = param(0.0, 'V', 'DC value (bias)')
        self.Vac = param(1.0, 'V', 'AC amplitude')
        self.Ph = param(0.0, '°', 'AC phase')

    def analog(self):
        self.V += self.Vdc

    def ac(self):
        return 'V', self.Vac * cmath.exp(1j * math.radians(self.Ph))
