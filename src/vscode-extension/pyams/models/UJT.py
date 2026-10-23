#-------------------------------------------------------------------------------
# Name:        UJT (unijunction transistor)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from math import exp
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt

_counter = [0]          # every UJT gets its own internal node name


def _limexp(x, xmax=40.0):
    """exp(x) that continues linearly after xmax (no overflow)."""
    if x <= xmax:
        return exp(x)
    return exp(xmax) * (1.0 + x - xmax)


# UJT Model ---------------------------------------------------------------------
class UJT(model):
    """
    Unijunction transistor: a silicon bar with two base contacts (B1, B2) and a
    p-n emitter junction on the bar (E).

                 B2 o----[ RB2 = (1-Eta) RBB ]----o A ----[ RB1 ]----o B1
                                                   |
                                                  >|  emitter diode
                                                   |
                                                   o E

    Between the bases the bar is a resistance RBB = RB1 + RB2 (inter-base
    resistance) and Eta = RB1 / RBB is the intrinsic stand-off ratio, so that
    with the emitter open the point A sits at  V(B1) + Eta (V(B2) - V(B1)).

    The emitter is a diode  Ie = Is (exp(Vea / N Vt) - 1)  into the point A.
    It conducts only when V(E) exceeds V(A) by about a diode drop, i.e. at the
    peak voltage  Vp ~ Eta (V(B2) - V(B1)) + Vd.  The holes it injects lower
    the resistance of the lower part of the bar (conductivity modulation),

        RB1 = Rsat + (Eta RBB - Rsat) / (1 + (Ie / Imod)^2),

    so after the peak the emitter voltage FALLS while the emitter current
    grows: the emitter characteristic Ve(Ie) has a negative-resistance region
    (peak point -> valley point), which makes the relaxation oscillator work.
    The resistance modulation is a smooth function of the emitter current, so
    no latch state is needed.

    Terminals: UJT(e, b1, b2).

    Parameters:
        RBB (ohm)   inter-base resistance with the emitter open (default 5 k)
        Eta         intrinsic stand-off ratio (default 0.6)
        Rsat (ohm)  lower bar resistance at high emitter current (default 20)
        Imod (A)    emitter current at which the modulation is halved
                    (default 0.15 mA, sets the valley point)
        Is (A), N, Vt (V)  emitter diode (1e-13 A, 1, 25 mV)
        Cbar (F)    small capacitance of the bar (internal node - B1, 2 pF): it
                    gives the internal node a time constant, which the solver
                    needs to follow the switching (like the pole of the OpAmp)
    """
    def __init__(self, e, b1, b2):
        _counter[0] += 1
        a = '_ujt%d_a' % _counter[0]              # internal bar node
        self.Vea = signal('in', voltage, e, a)    # emitter diode
        self.Ie = signal('out', current, e, a)
        self.V2 = signal('in', voltage, b2, a)    # upper part of the bar
        self.I2 = signal('out', current, b2, a)
        self.V1 = signal('in', voltage, a, b1)    # lower part of the bar
        self.I1 = signal('out', current, a, b1)

        self.RBB = param(5.0e3, 'Ω', 'Inter-base resistance')
        self.Eta = param(0.6, ' ', 'Intrinsic stand-off ratio')
        self.Rsat = param(20.0, 'Ω', 'Lower bar resistance at high Ie')
        self.Imod = param(1.5e-4, 'A', 'Conductivity-modulation current')
        self.Is = param(1.0e-13, 'A', 'Emitter diode saturation current')
        self.N = param(1.0, ' ', 'Emitter diode emission coefficient')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Cbar = param(2.0e-12, 'F', 'Bar capacitance (internal node to B1)')

    def analog(self):
        ie = self.Is * (_limexp(self.Vea / (self.N * self.Vt)) - 1.0)
        self.Ie += ie
        rb2 = (1.0 - self.Eta) * self.RBB
        rb1_0 = self.Eta * self.RBB
        x = (ie if ie > 0.0 else 0.0) / self.Imod
        rb1 = self.Rsat + (rb1_0 - self.Rsat) / (1.0 + x * x)
        self.I2 += self.V2 / rb2
        self.I1 += self.V1 / rb1 + self.Cbar * ddt(self.V1)
