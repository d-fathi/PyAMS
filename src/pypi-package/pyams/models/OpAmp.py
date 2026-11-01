#-------------------------------------------------------------------------------
# Name:        OpAmp (operational amplifier)
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import tanh
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt


# Operational Amplifier Model ------------------------------------------------------
class OpAmp(model):
    """
    This class implements an operational amplifier with a finite gain, output
    saturation and a single dominant pole.

    Terminals are given in the order (p, n, out): non-inverting input (+),
    inverting input (-) and output.  The inputs draw no current.

    The ideal output voltage follows the differential input Vd = V(p) - V(n) + Vos
    and saturates smoothly at the supply rails:

        Vtarget = Vmid + Vh * tanh(A * Vd / Vh)
        Vmid = (Vcc + Vee) / 2        Vh = (Vcc - Vee) / 2

    The output is a Thevenin source Vtarget behind the output resistance Ro,
    with a time constant Tau (the dominant pole), which limits the speed of the
    output:

        Iout = (Vout - Vtarget) / Ro + (Tau / Ro) * dVout/dt

    The pole is not a detail: a circuit with positive feedback (a comparator,
    a relaxation oscillator) makes the algebraic equations jump when the
    output switches, so without it the solver cannot follow the transition.

    Attributes:
        Vd (signal): Differential input voltage between p and n.
        Vo (signal): Output voltage, measured against ground.
        Io (signal): Output current from the output node to ground.
        A (param): Open-loop DC gain (default: 1.0e5).
        Vcc (param): Positive supply / saturation voltage (default: 12 V).
        Vee (param): Negative supply / saturation voltage (default: -12 V).
        Ro (param): Output resistance (default: 75 ohm).
        Tau (param): Output time constant (default: 0.2 us).
        Vos (param): Input offset voltage (default: 0 V).

    Methods:
        analog(): Defines the output equation above.

    Note: with the ideal offset Vos = 0 a perfectly symmetric oscillator stays
    at its unstable equilibrium (0 V) and never starts, like a noise-free
    real circuit; a small offset (1 mV) starts it, as real amplifiers have.
    """
    def __init__(self, p, n, out):
        # Signals declarations---------------------------------------------------
        self.Vd = signal('in', voltage, p, n)
        self.Vo = signal('in', voltage, out, '0')
        self.Io = signal('out', current, out, '0')
        # Parameter declarations-------------------------------------------------
        self.A = param(1.0e5, ' ', 'Open-loop DC gain')
        self.Vcc = param(12.0, 'V', 'Positive saturation voltage')
        self.Vee = param(-12.0, 'V', 'Negative saturation voltage')
        self.Ro = param(75.0, 'Ω', 'Output resistance')
        self.Tau = param(0.2e-6, 's', 'Output time constant')
        self.Vos = param(0.0, 'V', 'Input offset voltage')

    def analog(self):
        vmid = 0.5 * (self.Vcc + self.Vee)
        vh = 0.5 * (self.Vcc - self.Vee)
        vtarget = vmid + vh * tanh(self.A * (self.Vd + self.Vos) / vh)
        self.Io += (self.Vo - vtarget) / self.Ro + (self.Tau / self.Ro) * ddt(self.Vo)
