#-------------------------------------------------------------------------------
# Name:        IGBT (insulated-gate bipolar transistor, N-channel)
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import exp
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt

_counter = [0]          # every IGBT gets its own internal node name


def _limexp(x, xmax=40.0):
    """exp(x) that continues linearly after xmax (no overflow)."""
    if x <= xmax:
        return exp(x)
    return exp(xmax) * (1.0 + x - xmax)


def _mos(vgs, vds, kp, vth, lam):
    """Channel current of the N-channel MOS part (vds may be negative)."""
    if vds < 0.0:                                    # source and drain swap
        return -_mos(vgs - vds, -vds, kp, vth, lam)
    vov = vgs - vth
    if vov <= 0.0:                                   # off
        return 0.0
    if vds < vov:                                    # triode
        return kp * vds * (2.0 * vov - vds) * (1.0 + lam * vds)
    return kp * vov * vov * (1.0 + lam * vds)        # saturation


# IGBT Model -------------------------------------------------------------------
class IGBT(model):
    """
    N-channel IGBT, built as a MOSFET that drives the base of a PNP transistor
    (the classical macro-model).

                C (collector)
                |
               PNP emitter diode  Idc = Is (exp(Vd / N Vt) - 1)
                |            \\
                B (internal)  alpha * Idc  ---->-----+
                |                                    |
               MOS channel  Imos(Vge, Vb - Ve)       |
                |                                    |
                E (emitter) -------------------------+

    G is the insulated gate (only capacitive currents).  Kirchhoff's current
    law at the internal base node B gives

        (1 - alpha) * Idc + Tau * dIdc/dt = Imos

    so in steady state Ic = Imos / (1 - alpha): the MOS current is multiplied by
    the PNP gain (high current for a small gate drive), the on-state voltage
    is one diode drop plus the MOS channel drop, and Ic saturates at
    Kp (Vge - Vth)^2 / (1 - alpha).  When the gate is switched off the
    stored base charge (Tau) decays with Tau / (1 - alpha), which gives the
    typical turn-off "tail current".

    The device blocks reverse voltage (no body diode): put a Diode in
    anti-parallel for a freewheeling path (see igbt_chopper.py).

    Terminals: IGBT(c, g, e)

    Signals (between nodes):
        Vd  (c, B)  emitter-junction voltage      Id  (c, B)  junction current
        Vds (B, e)  MOS channel voltage           Ibe (B, e)  MOS + transport
        Vge (g, e)  gate-emitter voltage          Ige (g, e)  Cge charging
        Vgc (g, c)  gate-collector voltage        Igc (g, c)  Cgc (Miller)

    Parameters:
        Kp (A/V^2)   MOS transconductance, Imos(sat) = Kp (Vge - Vth)^2
        Vth (V)      gate threshold voltage
        Lambda (1/V) channel-length modulation
        Alpha        PNP transport factor (0 ... <1); Ic = Imos / (1 - Alpha)
        Is (A), N, Vt (V)  emitter-junction diode
        Tau (s)      base charge-storage time (turn-off tail)
        Cge, Cgc (F) gate-emitter and gate-collector (Miller) capacitances
    """
    def __init__(self, c, g, e):
        _counter[0] += 1
        b = '_igbt%d_b' % _counter[0]           # internal base node
        self.Vd = signal('in', voltage, c, b)
        self.Id = signal('out', current, c, b)
        self.Vds = signal('in', voltage, b, e)
        self.Ibe = signal('out', current, b, e)
        self.Vge = signal('in', voltage, g, e)
        self.Ige = signal('out', current, g, e)
        self.Vgc = signal('in', voltage, g, c)
        self.Igc = signal('out', current, g, c)

        self.Kp = param(0.1, 'A', 'MOS transconductance Kp [A/V^2]')
        self.Vth = param(5.0, 'V', 'Gate threshold voltage')
        self.Lambda = param(0.0, 'V', 'Channel-length modulation [1/V]')
        self.Alpha = param(0.5, ' ', 'PNP transport factor')
        self.Is = param(1.0e-14, 'A', 'Emitter junction saturation current')
        self.N = param(1.0, ' ', 'Emission coefficient')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Tau = param(1.0e-6, 'Sec', 'Base charge-storage time')
        self.Cge = param(5.0e-9, 'F', 'Gate-emitter capacitance')
        self.Cgc = param(2.0e-10, 'F', 'Gate-collector (Miller) capacitance')

    def analog(self):
        # PNP emitter junction: current and stored base charge Q = Tau * Idc ----
        idc = self.Is * (_limexp(self.Vd / (self.N * self.Vt)) - 1.0)
        self.Id += idc + ddt(self.Tau * idc)
        # collector current of the PNP (transported to E) and the MOS channel,
        # both leave the internal base node B and enter E ------------------------
        imos = _mos(self.Vge, self.Vds, self.Kp, self.Vth, self.Lambda)
        self.Ibe += self.Alpha * idc + imos
        # gate: insulated, only the capacitances -----------------------------------
        self.Ige += self.Cge * ddt(self.Vge)
        self.Igc += self.Cgc * ddt(self.Vgc)
