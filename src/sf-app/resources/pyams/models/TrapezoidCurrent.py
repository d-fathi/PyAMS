#-------------------------------------------------------------------------------
# Name:        Trapezoid current Source
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param, time
from pyams.lib import current


# Trapezoidal Current Source Model ---------------------------------------------
class TrapezoidCurrent(model):
    """
    This class models a Trapezoidal Waveform Current Source (the current
    counterpart of TrapezoidVoltage).

    The waveform has an initial delay (Td), a rising edge (Tr), a constant
    peak (Tw), a falling edge (Tf) and repeats with the period T.  A positive
    current flows through the source from node p to node n (SPICE convention,
    see DCCurrent).

    Attributes:
        I (signal): Current through the source, from p to n.
        I0 (param): Initial (low) current.
        I1 (param): Peak (high) current.
        Td (param): Initial delay time.
        Tr (param): Rise time.
        Tw (param): Pulse-width (high duration).
        Tf (param): Fall time.
        T (param): Total period of the waveform.
        Ioff (param): Offset current.

    The current waveform is defined as (cycle time c = (t - Td) mod T):

    - **Before the delay (t <= Td):**             I = I0 + Ioff
    - **Rising edge (0 <= c <= Tr):**             I = I0 + (I1 - I0) c / Tr + Ioff
    - **High state (Tr <= c <= Tr + Tw):**        I = I1 + Ioff
    - **Falling edge (Tr+Tw <= c <= Tr+Tw+Tf):** I falls linearly from I1 to I0
    - **Low state (afterwards):**                 I = I0 + Ioff

    Methods:
        analog(): Defines the trapezoidal waveform equation.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.I0 = param(0.0, 'A', 'Initial current')
        self.I1 = param(1e-3, 'A', 'Peak current')
        self.Td = param(0, 'Sec', 'Initial delay time')
        self.Tr = param(0, 'Sec', 'Rise time')
        self.Tw = param(0.05, 'Sec', 'Pulse-width')
        self.Tf = param(0, 'Sec', 'Fall time')
        self.T = param(0.1, 'Sec', 'Total period of the waveform')
        self.Ioff = param(0.0, 'A', 'Offset current')

    def analog(self):
        """Defines the trapezoidal waveform equation for the current."""
        t = time

        # Before initial delay
        if t <= self.Td:
            self.I += self.I0 + self.Ioff
            return

        c = (t - self.Td) % self.T          # time within the current cycle

        if c < self.Tr:                     # rising edge (Tr > 0 here)
            self.I += self.I0 + (self.I1 - self.I0) * c / self.Tr + self.Ioff
        elif c <= self.Tr + self.Tw:        # high state
            self.I += self.I1 + self.Ioff
        elif c < self.Tr + self.Tw + self.Tf:   # falling edge (Tf > 0 here)
            self.I += self.I1 + (self.I0 - self.I1) \
                * (c - self.Tr - self.Tw) / self.Tf + self.Ioff
        else:                               # low state
            self.I += self.I0 + self.Ioff
