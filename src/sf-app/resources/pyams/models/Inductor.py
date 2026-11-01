#-------------------------------------------------------------------------------
# Name:        Inductor
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


# Inductor Model -----------------------------------------------------------------
class Inductor(model):
    """
    This class implements an Inductor model.

    An inductor stores energy in a magnetic field and the voltage across it is
    proportional to the rate of change of its current.

    Attributes:
        I (signal): Input current signal through the inductor, defined between nodes (p, n).
        V (signal): Output voltage signal across the inductor, defined between nodes (p, n).
        L (param): Inductance value in Henries (H), default is 1.0e-3 H.

    Methods:
        analog(): Defines the inductor behavior using the equation:
                  V = L * dI/dt

    Note: the inductor imposes the voltage V, so its current is an extra unknown
    of the circuit (the 'in' current signal reads it).  In a DC analysis
    dI/dt = 0, so the inductor behaves as a short circuit.
    """
    def __init__(self, p, n):
        # Signals declarations---------------------------------------------------
        self.I = signal('in', current, p, n)
        self.V = signal('out', voltage, p, n)
        # Parameter declarations-------------------------------------------------
        self.L = param(1.0e-3, 'H', 'Inductor value')

    def analog(self):
        # V = L * dI/dt----------------------------------------------------------
        self.V += self.L * ddt(self.I)
