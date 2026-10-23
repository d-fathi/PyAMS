#-------------------------------------------------------------------------------
# Name:        JFET (junction field-effect transistor, N-channel / P-channel)
# Created:     18/10/2026
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


def _ids(vgs, vds, beta, vto, lam):
    """Channel current of an N-channel JFET for vds >= 0 (Shichman-Hodges)."""
    vov = vgs - vto
    if vov <= 0.0:                                   # pinched off
        return 0.0
    if vds < vov:                                    # triode (ohmic) region
        return beta * vds * (2.0 * vov - vds) * (1.0 + lam * vds)
    return beta * vov * vov * (1.0 + lam * vds)      # saturation


# JFET Model (Shichman-Hodges, SPICE level 1) -------------------------------------
class JFET(model):
    """
    This class implements a junction field-effect transistor (JFET).

    Terminals are given in the order (d, g, s): drain, gate, source.

    For an N-channel device (Type = 1), with vgs = V(g,s), vds = V(d,s) and
    vov = vgs - Vto (Vto is negative: the pinch-off voltage):

        vov <= 0               pinched off     Id = 0
        0 < vds < vov          triode          Id = Beta vds (2 vov - vds) (1 + Lambda vds)
        vds >= vov > 0         saturation      Id = Beta vov^2 (1 + Lambda vds)

    so the drain current at vgs = 0 in saturation is  Idss = Beta Vto^2.  If
    vds < 0 the drain and source change roles (the device is symmetric).
    A P-channel device (Type = -1) uses the same equations with all voltages and
    currents sign-reversed, with Vto still given as in the N-channel case (-2 V): the sign reversal of
    the voltages takes care of the polarity.

    The gate is a pair of p-n junctions (gate-source and gate-drain).  They are
    reverse biased in normal use and then draw almost nothing, but they conduct
    when the gate is driven positive (N-channel) by more than about 0.6 V:

        Igs = Is (exp(vgs / (N Vt)) - 1)         Igd = Is (exp(vgd / (N Vt)) - 1)

    Two constant junction capacitances Cgs and Cgd are added in parallel.

    Attributes:
        Vgs, Vds, Vgd (signal): Input voltages gate-source, drain-source, gate-drain.
        Id (signal): Output channel current from drain to source.
        Igs, Igd (signal): Output gate currents (junction + capacitor), gate to source / drain.
        Beta (param): Transconductance parameter in A/V^2 (default: 0.5 mA/V^2).
        Vto (param): Pinch-off voltage (default: -2 V for N-channel).
        Lambda (param): Channel-length modulation in 1/V (default: 0.01).
        Is (param): Gate junction saturation current (default: 1e-14 A).
        N (param): Gate junction ideality factor (default: 1).
        Vt (param): Thermal voltage (default: 0.025 V).
        Type (param): Polarity, 1 for N-channel (default) or -1 for P-channel.
        Cgs, Cgd (param): Gate capacitances (default: 2 pF and 1 pF).

    Methods:
        analog(): Defines the channel current, the gate junctions and capacitors.
    """
    def __init__(self, d, g, s):
        # Signals declarations---------------------------------------------------
        self.Vgs = signal('in', voltage, g, s)
        self.Vds = signal('in', voltage, d, s)
        self.Vgd = signal('in', voltage, g, d)
        self.Id = signal('out', current, d, s)
        self.Igs = signal('out', current, g, s)
        self.Igd = signal('out', current, g, d)

        # Parameters declarations----------------------------------------------
        self.Beta = param(0.5e-3, 'A/V²', 'Transconductance parameter')
        self.Vto = param(-2.0, 'V', 'Pinch-off (threshold) voltage')
        self.Lambda = param(0.01, '1/V', 'Channel-length modulation')
        self.Is = param(1.0e-14, 'A', 'Gate junction saturation current')
        self.N = param(1.0, ' ', 'Gate junction ideality factor')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Type = param(1, ' ', 'Polarity: 1 = N-channel, -1 = P-channel')
        self.Cgs = param(2.0e-12, 'F', 'Gate-source capacitance')
        self.Cgd = param(1.0e-12, 'F', 'Gate-drain capacitance')

    def analog(self):
        """Defines the channel current, gate junctions and gate capacitances."""
        k = float(self.Type)
        vgs = k * self.Vgs
        vds = k * self.Vds
        if vds >= 0.0:
            i = _ids(vgs, vds, self.Beta, self.Vto, self.Lambda)
        else:                                  # source and drain swap roles
            i = -_ids(vgs - vds, -vds, self.Beta, self.Vto, self.Lambda)
        self.Id += k * i

        # Gate junctions (forward conduction when the gate is driven the wrong way)
        nvt = self.N * self.Vt
        self.Igs += k * self.Is * (_limexp(vgs / nvt) - 1.0)
        self.Igd += k * self.Is * (_limexp((vgs - vds) / nvt) - 1.0)

        # Gate capacitances -----------------------------------------------------
        self.Igs += self.Cgs * ddt(self.Vgs)
        self.Igd += self.Cgd * ddt(self.Vgd)
