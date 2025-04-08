#-------------------------------------------------------------------------------
# Name:        Trapezoid current Source
# Author:      D.Fathi
# Created:     14/03/2017
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from pyams_lib import model, time, signal, param
from pyams_lib import current

# Trapezoidal Current Source Model ---------------------------------------------
class TrapezoidCurrent(model):
    """
    This class models a Trapezoidal Waveform Current Source.

    The current waveform follows a trapezoidal shape with:
    - An initial delay (Td)
    - A rising edge (Tr)
    - A constant peak (Tw)
    - A falling edge (Tf)
    - A periodic repetition (T)

    Attributes:
        I (signal): Output current.
        I0 (param): Initial current.
        I1 (param): Peak current.
        Td (param): Initial delay time.
        Tr (param): Rise time.
        Tw (param): Pulse-width (high duration).
        Tf (param): Fall time.
        T (param): Total period of the waveform.
        Ioff (param): Offset current.

    Methods:
        analog(): Defines the trapezoidal waveform equation.
    """

    def __init__(self, a, b):
        # Signal declaration
        self.I = signal('out', current, a, b)

        # Parameter declarations
        self.I0 = param(1.0, 'A', 'Initial current')
        self.I1 = param(1.0, 'A', 'Peak current')
        self.Td = param(0, 'Sec', 'Initial delay time')
        self.Tr = param(0, 'Sec', 'Rise time')
        self.Tw = param(0.05, 'Sec', 'Pulse-width')
        self.Tf = param(0, 'Sec', 'Fall time')
        self.T = param(0.1, 'Sec', 'Total period of the waveform')
        self.Ioff = param(0.0, 'A', 'Offset current')

    def analog(self):
        """Defines the trapezoidal waveform equation for current output."""
        t = time  # Get current simulation time

        # Before initial delay
        if t <= self.Td:
            self.I += self.I0 + self.Ioff
            return

        # Time within the current cycle
        cycle_time = (t - self.Td) % self.T

        # Rising edge: 0 → Tr
        if cycle_time <= self.Tr:
            slope = (self.I1 - self.I0) / self.Tr
            self.I += slope * cycle_time + self.I0 + self.Ioff

        # High state: Tr → (Tr + Tw)
        elif cycle_time <= (self.Tr + self.Tw):
            self.I += self.I1 + self.Ioff

        # Falling edge: (Tr + Tw) → (Tr + Tw + Tf)
        elif cycle_time <= (self.Tr + self.Tw + self.Tf):
            slope = (self.I0 - self.I1) / self.Tf
            self.I += slope * (cycle_time - self.Tr - self.Tw) + self.I1 + self.Ioff

        # Low state: After (Tr + Tw + Tf)
        else:
            self.I += self.I0 + self.Ioff



