#-------------------------------------------------------------------------------
# Name:        Tunnel diode (Esaki diode)
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
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


# Tunnel diode Model ----------------------------------------------------------------
class TunnelDiode(model):
    """
    Tunnel (Esaki) diode: a heavily doped p-n junction whose I(V) curve has a
    negative-resistance region between the peak (Vp, Ip) and the valley.

        I(V) = Itunnel + Iexcess + Ithermal + Cj dV/dt

        Itunnel  = Ip (V / Vp) exp(1 - V / Vp)             peak exactly at (Vp, Ip)
        Iexcess  = Ix (exp(Kex (V - Vx)) - exp(-Kex Vx))   trap-assisted tunnelling,
                                                           it makes the valley
        Ithermal = Is (exp(V / N Vt) - 1)                  ordinary diode injection

    The current is a single-valued function of the voltage, so the diode can be
    swept with a voltage source (it is an "N-type" negative resistance: stable
    when driven by a voltage source, unstable with a high-impedance parallel
    inductor-capacitor circuit -> oscillator).

    Terminals: TunnelDiode(p, n)   (anode, cathode).

    Parameters:
        Ip (A), Vp (V)    peak current and peak voltage    (5 mA, 0.1 V)
        Ix (A), Vx (V)    excess current scale and offset  (0.1 mA, 0.35 V)
        Kex (1/V)         excess current exponent          (15)
        Is (A), N, Vt     thermal diode                    (1e-12 A, 1, 25 mV)
        Cj (F)            junction capacitance             (10 pF)
    """
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)

        self.Ip = param(5.0e-3, 'A', 'Peak current')
        self.Vp = param(0.1, 'V', 'Peak voltage')
        self.Ix = param(1.0e-4, 'A', 'Excess current scale')
        self.Vx = param(0.35, 'V', 'Excess current voltage offset')
        self.Kex = param(15.0, '1/V', 'Excess current exponent')
        self.Is = param(1.0e-12, 'A', 'Thermal saturation current')
        self.N = param(1.0, ' ', 'Emission coefficient')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Cj = param(10.0e-12, 'F', 'Junction capacitance')

    def analog(self):
        v = self.V
        itun = self.Ip * (v / self.Vp) * _limexp(1.0 - v / self.Vp)
        iex = self.Ix * (_limexp(self.Kex * (v - self.Vx)) - exp(-self.Kex * self.Vx))
        ith = self.Is * (_limexp(v / (self.N * self.Vt)) - 1.0)
        self.I += itun + iex + ith + self.Cj * ddt(v)
