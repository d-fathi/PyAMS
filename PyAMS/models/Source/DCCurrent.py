#-------------------------------------------------------------------------------
# Name:        Source Idc
# Author:      D.fathi
# Created:     20/03/2015
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free GPLv3
#-------------------------------------------------------------------------------

from pyams_lib import signal, param, model
from pyams_lib import current

# DC Current Source Model------------------------------------------------------
class DCCurrent(model):
    """
    This class models a DC Current Source that provides a constant current.

    The output current (I) remains fixed at a specified value (Idc), independent 
    of voltage or other circuit conditions:

        I = Idc

    Where:
    - I: Output current through terminals (p, n)
    - Idc: Constant DC current value (default: 1mA)

    Attributes:
        I (signal): Output current.
        Idc (param): Constant current value.

    Methods:
        analog(): Defines the constant current output.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.I = signal('out', current, p, n)

        # Parameter declaration
        self.Idc = param(0.001, 'A', 'Value of constant current')

    def analog(self):
        """Defines the constant current output equation."""
        self.I += self.Idc  # I = Idc


