#-------------------------------------------------------------------------------
# Name:        BJT (bipolar junction transistor, NPN / PNP)
# Created:     15/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from math import exp
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


def _limexp(x, xmax=40.0):
    """exp(x) that continues linearly after xmax (no overflow, and Newton
    steps stay sane if a junction is driven far into forward bias)."""
    if x <= xmax:
        return exp(x)
    return exp(xmax) * (1.0 + x - xmax)


# BJT Model (Ebers-Moll, transport form) ----------------------------------------
class BJT(model):
    """
    This class implements a bipolar junction transistor (Ebers-Moll model).

    Terminals are given in the order (c, b, e): collector, base, emitter.

    With the junction voltages of an NPN transistor, Vbe = V(b,e) and
    Vbc = V(b,c):

        If = Is * (exp(Vbe / Vt) - 1)        forward diode current
        Ir = Is * (exp(Vbc / Vt) - 1)        reverse diode current
        Ic = If - Ir * (1 + 1 / Br)          current into the collector
        Ib = If / Bf + Ir / Br               current into the base

    and the emitter carries -(Ic + Ib).  A PNP transistor (Type = -1) uses the
    same equations with all voltages and currents sign-reversed.

    Two constant junction capacitances are added in parallel with the diodes,
    as in a real transistor:

        Cje * d(Vbe)/dt  between base and emitter
        Cjc * d(Vbc)/dt  between base and collector

    They are not a detail: with Cje = Cjc = 0 every node coupled through a
    capacitor has no capacitance of its own, and a regenerative circuit (an
    astable multivibrator, a latch) makes the circuit equations jump
    discontinuously when a transistor switches, so no time step can follow
    it and the solver fails.  The defaults are those of a 2N3904 (small-signal NPN).

    Attributes:
        Vbe (signal): Input voltage between base and emitter.
        Vbc (signal): Input voltage between base and collector.
        Ic (signal): Output current from collector to emitter.
        Ib (signal): Output current from base to emitter.
        Is (param): Saturation current (default: 1.0e-14 A).
        Vt (param): Thermal voltage (default: 0.025 V).
        Bf (param): Forward current gain (default: 100).
        Br (param): Reverse current gain (default: 1).
        Type (param): Polarity, 1 for NPN (default) or -1 for PNP.
        Cje (param): Base-emitter junction capacitance (default: 4.5 pF).
        Cjc (param): Base-collector junction capacitance (default: 3.6 pF).

    Methods:
        analog(): Defines the Ebers-Moll equations above plus the capacitances.
    """
    def __init__(self, c, b, e):
        # Signals declarations------------------------------------------------
        self.Vbe = signal('in', voltage, b, e)
        self.Vbc = signal('in', voltage, b, c)
        self.Ic = signal('out', current, c, e)
        self.Ib = signal('out', current, b, e)

        # Parameters declarations----------------------------------------------
        self.Is = param(1.0e-14, 'A', 'Saturation current')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Bf = param(100.0, ' ', 'Forward current gain')
        self.Br = param(1.0, ' ', 'Reverse current gain')
        self.Type = param(1, ' ', 'Polarity: 1 = NPN, -1 = PNP')
        self.Cje = param(4.5e-12, 'F', 'Base-emitter junction capacitance')
        self.Cjc = param(3.6e-12, 'F', 'Base-collector junction capacitance')

    def analog(self):
        """Defines the collector and base currents (Ebers-Moll equations)."""
        k = float(self.Type)
        If = self.Is * (_limexp(k * self.Vbe / self.Vt) - 1.0)
        Ir = self.Is * (_limexp(k * self.Vbc / self.Vt) - 1.0)
        self.Ic += k * (If - Ir * (1.0 + 1.0 / self.Br))
        self.Ib += k * (If / self.Bf + Ir / self.Br)

        # Junction capacitances (same sign convention for NPN and PNP) --------
        self.Ib += self.Cje * ddt(self.Vbe)      # base -> emitter
        Icap = self.Cjc * ddt(self.Vbc)          # base -> collector
        self.Ib += Icap                          # leaves the base ...
        self.Ic -= Icap                          # ... and enters the collector
