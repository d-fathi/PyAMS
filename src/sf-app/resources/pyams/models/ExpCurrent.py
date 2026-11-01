#-------------------------------------------------------------------------------
# Name:        Exponential current source (SPICE EXP)
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import signal, param, model, time
from pyams.lib import current
from .ExpVoltage import exp_wave


class ExpCurrent(model):
    """
    Exponential current source (SPICE ``EXP``); same waveform as ExpVoltage.
    The current I flows from p to n through the source.

    Terminals: ExpCurrent(p, n)
    Parameters:
        I1   initial value (A)                 (0)
        I2   pulsed value (A)                  (1 mA)
        TD1  rise delay time (s)               (1 ms)
        TAU1 rise time constant (s)            (1 ms)
        TD2  fall delay time (s)               (5 ms)
        TAU2 fall time constant (s)            (1 ms)
    The DC (operating point) value is I1.
    """
    def __init__(self, p, n):
        self.I = signal('out', current, p, n)
        self.I1 = param(0.0, 'A', 'Initial value')
        self.I2 = param(1e-3, 'A', 'Pulsed value')
        self.TD1 = param(1e-3, 's', 'Rise delay time')
        self.TAU1 = param(1e-3, 's', 'Rise time constant')
        self.TD2 = param(5e-3, 's', 'Fall delay time')
        self.TAU2 = param(1e-3, 's', 'Fall time constant')

    def analog(self):
        self.I += exp_wave(float(time), float(self.I1), float(self.I2), float(self.TD1),
                           float(self.TAU1), float(self.TD2), float(self.TAU2))
