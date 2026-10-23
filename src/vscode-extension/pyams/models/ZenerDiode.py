#-------------------------------------------------------------------------------
# Name:        Zener diode
# Created:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from math import exp
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


def _limexp(x, xmax=40.0):
    """exp(x) that continues linearly after xmax (no overflow)."""
    if x <= xmax:
        return exp(x)
    return exp(xmax) * (1.0 + x - xmax)


# Zener diode Model --------------------------------------------------------------
class ZenerDiode(model):
    """
    Zener diode: a normal junction in the forward direction and a sharp reverse
    breakdown at the zener voltage Vz.

        I(V) = Is (exp(V / N Vt) - 1)                      forward / leakage
               - Ibv exp(-(V + Vz) / (Nz Vt))              breakdown knee
               - max(-(V + Vz), 0) / Rz                    slope beyond the knee
               + Cj dV/dt

    V is the voltage from anode (p) to cathode (n), so the breakdown happens for
    V = -Vz (cathode more positive than the anode by Vz).

    * Vz is the voltage at which the reverse current equals Ibv (the "test
      current", 1 mA by default) : Vz is what the data sheet calls V_Z at I_ZT.
    * The knee is rounded by Nz: near the test current the dynamic resistance is
      rz ~ Nz Vt / I (Nz = 1.5 gives 37 ohm at 1 mA, 7.5 ohm at 5 mA).
    * Rz is the bulk (series) resistance that dominates at high current: the
      current beyond the knee rises as (|V| - Vz) / Rz.

    Terminals: ZenerDiode(p, n)   (anode, cathode).  Use it with the cathode
    towards the positive supply.

    Parameters:
        Vz (V)     zener voltage at the test current (5.1)
        Ibv (A)    test current (1 mA)
        Nz         breakdown knee sharpness (1.5)
        Rz (ohm)   bulk resistance beyond the knee (5)
        Is (A), N, Vt   forward junction (1e-14 A, 1, 25 mV)
        Cj (F)     junction capacitance (50 pF)
    """
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        self.Vz = param(5.1, 'V', 'Zener voltage at the test current')
        self.Ibv = param(1.0e-3, 'A', 'Test current')
        self.Nz = param(1.5, ' ', 'Breakdown knee sharpness')
        self.Rz = param(5.0, 'Ω', 'Bulk resistance beyond the knee')
        self.Is = param(1.0e-14, 'A', 'Forward saturation current')
        self.N = param(1.0, ' ', 'Forward emission coefficient')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Cj = param(50.0e-12, 'F', 'Junction capacitance')

    def analog(self):
        v = self.V
        ifw = self.Is * (_limexp(v / (self.N * self.Vt)) - 1.0)
        vb = -(v + self.Vz)                      # > 0 beyond the zener voltage
        ibr = self.Ibv * _limexp(vb / (self.Nz * self.Vt))
        if vb > 0.0:
            ibr += vb / self.Rz
        self.I += ifw - ibr + self.Cj * ddt(v)
