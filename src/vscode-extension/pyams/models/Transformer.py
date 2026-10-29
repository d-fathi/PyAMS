#-------------------------------------------------------------------------------
# Name:        Transformer (two magnetically coupled inductors)
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import sqrt
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


# Transformer Model --------------------------------------------------------------
class Transformer(model):
    """
    This class implements a transformer: two inductors with a mutual inductance.

    Terminals are given in the order (p1, n1, p2, n2): primary winding between
    p1 and n1, secondary winding between p2 and n2.  Both currents are
    positive when they flow into the winding at its p terminal (the dots are
    at p1 and p2).

        V1 = L1 * dI1/dt + M * dI2/dt
        V2 = M * dI1/dt + L2 * dI2/dt

    The mutual inductance M is the same in both equations (reciprocity), so the
    coupling factor is  k = M / sqrt(L1 * L2)  (k = 1 for an ideal core).  The
    turns ratio is  n = N2/N1 = sqrt(L2 / L1), and for k close to 1 the
    secondary voltage is  V2 ~ n * V1.

    Attributes:
        I1, I2 (signal): Currents of the primary / secondary winding.
        V1, V2 (signal): Voltages of the primary / secondary winding.
        L1 (param): Primary inductance in Henries (default: 100 mH).
        L2 (param): Secondary inductance in Henries (default: 25 mH).
        M  (param): Mutual inductance in Henries (default: 49.5 mH, i.e. k = 0.99).

    Methods:
        analog(): Defines the two coupled-inductor equations above.

    Note: the two windings are isolated from each other, so one terminal of
    each winding must be connected to the rest of the circuit (e.g. through a
    diode bridge or a load) for the equations to have a unique solution.
    In DC the windings are short circuits (dI/dt = 0), so never connect the
    primary directly across an ideal voltage source: add a series resistance
    (the winding resistance).  M must satisfy
    |M| <= sqrt(L1 * L2).
    """
    def __init__(self, p1, n1, p2, n2):
        # Signals declarations---------------------------------------------------
        self.I1 = signal('in', current, p1, n1)
        self.I2 = signal('in', current, p2, n2)
        self.V1 = signal('out', voltage, p1, n1)
        self.V2 = signal('out', voltage, p2, n2)
        # Parameter declarations-------------------------------------------------
        self.L1 = param(100.0e-3, 'H', 'Primary inductance')
        self.L2 = param(25.0e-3, 'H', 'Secondary inductance')
        self.M = param(49.5e-3, 'H', 'Mutual inductance')

    def analog(self):
        if abs(self.M) > sqrt(self.L1 * self.L2) * (1 + 1e-9):
            raise ValueError("Transformer: |M| must not exceed sqrt(L1*L2)")
        d1 = ddt(self.I1)
        d2 = ddt(self.I2)
        self.V1 += self.L1 * d1 + self.M * d2
        self.V2 += self.M * d1 + self.L2 * d2
