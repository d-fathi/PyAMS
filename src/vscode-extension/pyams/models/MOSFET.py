#-------------------------------------------------------------------------------
# Name:        MOSFET (N-channel / P-channel, level 1)
# Created:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


def _ids(vgs, vds, beta, vth, lam):
    """Drain current of an N-channel level-1 MOSFET for vds >= 0."""
    vov = vgs - vth
    if vov <= 0.0:                                   # cut-off
        return 0.0
    if vds < vov:                                    # triode (linear) region
        return beta * (vov * vds - 0.5 * vds * vds) * (1.0 + lam * vds)
    return 0.5 * beta * vov * vov * (1.0 + lam * vds)    # saturation


# MOSFET Model (Shichman-Hodges, level 1) ---------------------------------------
class MOSFET(model):
    """
    This class implements a MOSFET (square-law, level 1 model) with the bulk
    connected to the source.

    Terminals are given in the order (d, g, s): drain, gate, source.

    For an N-channel device (Type = 1), with vgs = V(g,s), vds = V(d,s),
    beta = Kp * W / L and vov = vgs - Vth:

        vov <= 0                 cut-off       Id = 0
        0 < vds < vov            triode        Id = beta (vov vds - vds^2/2) (1 + Lambda vds)
        vds >= vov > 0           saturation    Id = beta/2 vov^2 (1 + Lambda vds)

    If vds < 0 the drain and source change roles (the device is symmetric).
    A P-channel device (Type = -1) uses the same equations with all voltages and
    currents sign-reversed, with Vth the (positive) magnitude of its threshold.

    Two constant gate capacitances are added, as in a real transistor:

        Cgs * d(Vgs)/dt   between gate and source
        Cgd * d(Vgd)/dt   between gate and drain

    They matter: the gate draws no DC current, so without them the gate of a
    transistor driven only by other transistors has no capacitance of its own.

    Attributes:
        Vgs, Vds, Vgd (signal): Input voltages gate-source, drain-source, gate-drain.
        Id (signal): Output current from drain to source.
        Igs, Igd (signal): Gate capacitor currents (gate-source, gate-drain).
        Kp (param): Transconductance parameter in A/V^2 (default: 100 uA/V^2).
        W, L (param): Channel width and length in metres (default: 10 um / 1 um).
        Vth (param): Threshold voltage magnitude (default: 1 V).
        Lambda (param): Channel-length modulation in 1/V (default: 0.02).
        Type (param): Polarity, 1 for N-channel (default) or -1 for P-channel.
        Cgs, Cgd (param): Gate capacitances (default: 20 fF each).

    Methods:
        analog(): Defines the drain current and the gate capacitor currents.
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
        self.Kp = param(100.0e-6, 'A/V²', 'Transconductance parameter')
        self.W = param(10.0e-6, 'm', 'Channel width')
        self.L = param(1.0e-6, 'm', 'Channel length')
        self.Vth = param(1.0, 'V', 'Threshold voltage (magnitude)')
        self.Lambda = param(0.02, '1/V', 'Channel-length modulation')
        self.Type = param(1, ' ', 'Polarity: 1 = N-channel, -1 = P-channel')
        self.Cgs = param(20.0e-15, 'F', 'Gate-source capacitance')
        self.Cgd = param(20.0e-15, 'F', 'Gate-drain capacitance')

    def analog(self):
        """Defines the drain current (square-law) and the gate capacitances."""
        k = float(self.Type)
        beta = self.Kp * self.W / self.L
        vgs = k * self.Vgs
        vds = k * self.Vds
        if vds >= 0.0:
            i = _ids(vgs, vds, beta, self.Vth, self.Lambda)
        else:                                  # source and drain swap roles
            i = -_ids(vgs - vds, -vds, beta, self.Vth, self.Lambda)
        self.Id += k * i

        # Gate capacitances -----------------------------------------------------
        self.Igs += self.Cgs * ddt(self.Vgs)
        self.Igd += self.Cgd * ddt(self.Vgd)
