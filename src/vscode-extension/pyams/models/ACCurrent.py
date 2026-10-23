#-------------------------------------------------------------------------------
# Name:        ACCurrent (current source with an AC small-signal stimulus)
# Created:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

import cmath
import math
from pyams.lib import signal, param, model
from pyams.lib import current


# AC Current Source Model ------------------------------------------------------
class ACCurrent(model):
    """
    Current source for the AC (small-signal frequency) analysis.

    In DC and transient analyses it is a constant source  I = Idc  (0 A by
    default).  In  ``analysis(mode="ac", ...)``  it injects the phasor
    Iac * exp(j Ph) at every frequency.  Direction as in DCCurrent: a positive
    current flows through the source from node p to node n.

    Attributes:
        I (signal): Current through the source, from p to n.
        Idc (param): DC value in Amperes (default 0 A).
        Iac (param): AC amplitude in Amperes (default 1 A).
        Ph (param): AC phase in degrees (default 0).
    """
    def __init__(self, p, n):
        self.I = signal('out', current, p, n)

        self.Idc = param(0.0, 'A', 'DC value (bias)')
        self.Iac = param(1.0, 'A', 'AC amplitude')
        self.Ph = param(0.0, '°', 'AC phase')

    def analog(self):
        self.I += self.Idc

    def ac(self):
        return 'I', self.Iac * cmath.exp(1j * math.radians(self.Ph))
