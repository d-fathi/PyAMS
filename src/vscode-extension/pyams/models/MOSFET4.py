#-------------------------------------------------------------------------------
# Name:        MOSFET4 (4-terminal MOSFET with body effect, level 1)
# Created:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from math import exp, sqrt
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


def _limexp(x, xmax=40.0):
    """exp(x) that continues linearly after xmax (no overflow)."""
    if x <= xmax:
        return exp(x)
    return exp(xmax) * (1.0 + x - xmax)


def _ids(vov, vds, beta, lam):
    """Drain current of an N-channel level-1 MOSFET, vds >= 0, vov = vgs - vth."""
    if vov <= 0.0:                                   # cut-off
        return 0.0
    if vds < vov:                                    # triode (linear) region
        return beta * (vov * vds - 0.5 * vds * vds) * (1.0 + lam * vds)
    return 0.5 * beta * vov * vov * (1.0 + lam * vds)    # saturation


# MOSFET Model (Shichman-Hodges, level 1, four terminals) -------------------------
class MOSFET4(model):
    """
    Four-terminal MOSFET (drain, gate, source, bulk): the level-1 square-law
    model of MOSFET with the *body effect* and the bulk junctions.

    Terminals are given in the order (d, g, s, b).

    For an N-channel device (Type = 1), with vgs = V(g,s), vds = V(d,s),
    vbs = V(b,s), beta = Kp W / L:

        Vth = Vth0 + Gamma ( sqrt(Phi - vbs) - sqrt(Phi) )        (body effect)
        vov = vgs - Vth

        vov <= 0                 cut-off       Id = 0
        0 < vds < vov            triode        Id = beta (vov vds - vds^2/2) (1 + Lambda vds)
        vds >= vov > 0           saturation    Id = beta/2 vov^2 (1 + Lambda vds)

    A source that is more positive than the bulk (vbs < 0, "reverse body
    bias") raises the threshold: this is why an N-channel pass transistor
    cannot pass a full high level, and why stacked transistors (NAND, source
    followers) are slower than the 3-terminal model predicts.

    The device is symmetric: if vds < 0 the drain and source change roles and
    the body effect is taken against the new source (vbd).  A P-channel device
    (Type = -1) uses the same equations with all voltages and currents
    sign-reversed, Vth0 being the (positive) magnitude of its threshold.

    Bulk junctions (diodes bulk-source and bulk-drain, forward when the bulk is
    more positive than the channel end for an N device)

        Ibs = Is (exp(vbs / (N Vt)) - 1)        Ibd = Is (exp(vbd / (N Vt)) - 1)

    and constant capacitances Cgs, Cgd, Cgb (gate) and Cbs, Cbd (junctions).

    Attributes:
        Vgs, Vds, Vgd, Vbs, Vbd, Vgb (signal): input voltages.
        Id (signal): output drain-source channel current.
        Ibs, Ibd, Igs, Igd, Igb (signal): junction and capacitor currents.
        Kp (A/V^2, 100 uA/V^2), W, L (10 um, 1 um), Vth0 (1 V), Lambda (0.02 1/V),
        Gamma (body-effect coefficient, 0.5 sqrt(V)), Phi (surface potential, 0.7 V),
        Type (1 N-channel, -1 P-channel), Is (1e-14 A), N (1), Vt (25 mV),
        Cgs, Cgd (20 fF), Cgb (10 fF), Cbs, Cbd (10 fF).

    With Gamma = 0 and the bulk tied to the source the model reduces to MOSFET
    (apart from the junction diodes and the extra capacitances).
    """
    def __init__(self, d, g, s, b):
        # Signals declarations---------------------------------------------------
        self.Vgs = signal('in', voltage, g, s)
        self.Vds = signal('in', voltage, d, s)
        self.Vgd = signal('in', voltage, g, d)
        self.Vbs = signal('in', voltage, b, s)
        self.Vbd = signal('in', voltage, b, d)
        self.Id = signal('out', current, d, s)
        self.Ibs = signal('out', current, b, s)
        self.Ibd = signal('out', current, b, d)
        self.Igs = signal('out', current, g, s)
        self.Igd = signal('out', current, g, d)
        self.Igb = signal('out', current, g, b)
        self.Vgb = signal('in', voltage, g, b)

        # Parameters declarations----------------------------------------------
        self.Kp = param(100.0e-6, 'A/V²', 'Transconductance parameter')
        self.W = param(10.0e-6, 'm', 'Channel width')
        self.L = param(1.0e-6, 'm', 'Channel length')
        self.Vth0 = param(1.0, 'V', 'Zero-bias threshold voltage (magnitude)')
        self.Lambda = param(0.02, '1/V', 'Channel-length modulation')
        self.Gamma = param(0.5, '√V', 'Body-effect coefficient')
        self.Phi = param(0.7, 'V', 'Surface potential')
        self.Type = param(1, ' ', 'Polarity: 1 = N-channel, -1 = P-channel')
        self.Is = param(1.0e-14, 'A', 'Bulk junction saturation current')
        self.N = param(1.0, ' ', 'Bulk junction emission coefficient')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Cgs = param(20.0e-15, 'F', 'Gate-source capacitance')
        self.Cgd = param(20.0e-15, 'F', 'Gate-drain capacitance')
        self.Cgb = param(10.0e-15, 'F', 'Gate-bulk capacitance')
        self.Cbs = param(10.0e-15, 'F', 'Bulk-source junction capacitance')
        self.Cbd = param(10.0e-15, 'F', 'Bulk-drain junction capacitance')

    def _vth(self, vbs):
        """Threshold with the body effect (vbs in the N-channel sense)."""
        arg = self.Phi - vbs
        if arg < 1.0e-3:                     # forward-biased bulk: keep the root real
            arg = 1.0e-3
        return self.Vth0 + self.Gamma * (sqrt(arg) - sqrt(self.Phi))

    def analog(self):
        k = float(self.Type)
        beta = self.Kp * self.W / self.L
        vds = k * self.Vds
        if vds >= 0.0:                       # normal: the source terminal is the source
            vov = k * self.Vgs - self._vth(k * self.Vbs)
            i = _ids(vov, vds, beta, self.Lambda)
        else:                                # swapped: the drain terminal acts as source
            vov = k * self.Vgd - self._vth(k * self.Vbd)
            i = -_ids(vov, -vds, beta, self.Lambda)
        self.Id += k * i

        # bulk junctions: forward when k*vb* > 0
        nvt = self.N * self.Vt
        self.Ibs += k * self.Is * (_limexp(k * self.Vbs / nvt) - 1.0)
        self.Ibd += k * self.Is * (_limexp(k * self.Vbd / nvt) - 1.0)

        # capacitances ------------------------------------------------------------
        self.Igs += self.Cgs * ddt(self.Vgs)
        self.Igd += self.Cgd * ddt(self.Vgd)
        self.Igb += self.Cgb * ddt(self.Vgb)
        self.Ibs += self.Cbs * ddt(self.Vbs)
        self.Ibd += self.Cbd * ddt(self.Vbd)
