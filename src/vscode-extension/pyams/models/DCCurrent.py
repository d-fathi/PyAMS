#-------------------------------------------------------------------------------
# Name:        DCCurrent (constant current source)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import current


# DC Current Source Model ------------------------------------------------------
class DCCurrent(model):
    """
    This class models a constant (DC) current source.

    The current is  I = Idc  at all times, whatever the voltage across it
    (a bias current, a charging current, the tail current of a pair ...).

    Direction (same as the SPICE source "I p n"): a positive current flows
    through the source from node p to node n, i.e. it is taken out of node p
    and pushed into node n.  A source from "0" to "x" with Idc > 0 therefore
    raises the voltage of node x.

    Attributes:
        I (signal): Current through the source, from p to n.
        Idc (param): Current value in Amperes (A), default is 1 mA.

    Methods:
        analog(): Implements the equation I = Idc.
    """
    def __init__(self, p, n):
        # Signal declaration
        self.I = signal('out', current, p, n)

        # Parameter declaration
        self.Idc = param(1e-3, 'A', 'Constant current value')

    def analog(self):
        """Implements the constant current equation."""
        self.I += self.Idc
