#-------------------------------------------------------------------------------
# Name:        Exponential voltage source (SPICE EXP)
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from math import exp
from pyams.lib import signal, param, model, time
from pyams.lib import voltage


def exp_wave(t, v1, v2, td1, tau1, td2, tau2):
    """SPICE EXP waveform: rises from v1 towards v2 after td1 (time constant
    tau1), then falls back towards v1 after td2 (time constant tau2)."""
    if t < td1:
        return v1
    y = v1 + (v2 - v1) * (1.0 - exp(-(t - td1) / tau1))
    if t >= td2:
        y += (v1 - v2) * (1.0 - exp(-(t - td2) / tau2))
    return y


class ExpVoltage(model):
    """
    Exponential voltage source (SPICE ``EXP``).

        t <  TD1        : V = V1
        TD1 <= t < TD2  : V = V1 + (V2 - V1) (1 - exp(-(t - TD1)/TAU1))
        t >= TD2        : V = V1 + (V2 - V1) (1 - exp(-(t - TD1)/TAU1))
                                + (V1 - V2) (1 - exp(-(t - TD2)/TAU2))

    Terminals: ExpVoltage(p, n)   (V(p) - V(n) = V).
    Parameters:
        V1   initial value (V)                 (0)
        V2   pulsed value (V)                  (5)
        TD1  rise delay time (s)               (1 ms)
        TAU1 rise time constant (s)            (1 ms)
        TD2  fall delay time (s)               (5 ms)
        TAU2 fall time constant (s)            (1 ms)
    The DC (operating point) value is V1.
    """
    def __init__(self, p, n):
        self.V = signal('out', voltage, p, n)
        self.V1 = param(0.0, 'V', 'Initial value')
        self.V2 = param(5.0, 'V', 'Pulsed value')
        self.TD1 = param(1e-3, 's', 'Rise delay time')
        self.TAU1 = param(1e-3, 's', 'Rise time constant')
        self.TD2 = param(5e-3, 's', 'Fall delay time')
        self.TAU2 = param(1e-3, 's', 'Fall time constant')

    def analog(self):
        self.V += exp_wave(float(time), float(self.V1), float(self.V2), float(self.TD1),
                           float(self.TAU1), float(self.TD2), float(self.TAU2))
