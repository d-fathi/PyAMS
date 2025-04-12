#-------------------------------------------------------------------------------
# Name:        Trapezoid voltage Source
# Author:      D.Fathi
# Created:     14/03/2017
# Modified:    23/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param, time
from pyams_lib import voltage

# Trapezoidal Voltage Source Model ---------------------------------------------
class TrapezoidVoltage(model):
    """
    This class models a Trapezoidal Waveform Voltage Source.

    The voltage waveform follows a trapezoidal shape with:
    - An initial delay (Td)
    - A rising edge (Tr)
    - A constant peak (Tw)
    - A falling edge (Tf)
    - A periodic repetition (T)

    Attributes:
        V (signal): Output voltage.
        V0 (param): Initial voltage.
        V1 (param): Peak voltage.
        Td (param): Initial delay time.
        Tr (param): Rise time.
        Tw (param): Pulse-width (high duration).
        Tf (param): Fall time.
        T (param): Total period of the waveform.
        Voff (param): Offset voltage.

    The voltage waveform is defined as:

    - **Before initial delay (t ≤ Td):**  
      V = V0 + Voff

    - **During the rising edge (0 ≤ t ≤ Tr):**  
      V = ((V1 - V0) / Tr) * t + V0 + Voff

    - **During the high state (Tr ≤ t ≤ Tr + Tw):**  
      V = V1 + Voff

    - **During the falling edge (Tr + Tw ≤ t ≤ Tr + Tw + Tf):**  
      V = ((V0 - V1) / Tf) * (t - Tr - Tw) + V1 + Voff

    - **During the low state (t > Tr + Tw + Tf):**  
      V = V0 + Voff

    Methods:
        analog(): Defines the trapezoidal waveform equation.
    """

    def __init__(self, a, b):
        # Signal declaration
        self.V = signal('out', voltage, a, b)

        # Parameter declarations
        self.V0 = param(1.0, 'V', 'Initial voltage')
        self.V1 = param(1.0, 'V', 'Peak voltage')
        self.Td = param(0, 'Sec', 'Initial delay time')
        self.Tr = param(0, 'Sec', 'Rise time')
        self.Tw = param(0.05, 'Sec', 'Pulse-width')
        self.Tf = param(0, 'Sec', 'Fall time')
        self.T = param(0.1, 'Sec', 'Total period of the waveform')
        self.Voff = param(0.0, 'V', 'Offset voltage')

    def analog(self):
        """Defines the trapezoidal waveform equation for voltage output."""
        t = time  # Get current simulation time

        # Before initial delay
        if t <= self.Td:
            self.V += self.V0 + self.Voff
            return

        # Time within the current cycle
        cycle_time = (t - self.Td) % self.T

        # Rising edge: 0 → Tr
        if cycle_time <= self.Tr:
            slope = (self.V1 - self.V0) / self.Tr
            self.V += slope * cycle_time + self.V0 + self.Voff

        # High state: Tr → (Tr + Tw)
        elif cycle_time <= (self.Tr + self.Tw):
            self.V += self.V1 + self.Voff

        # Falling edge: (Tr + Tw) → (Tr + Tw + Tf)
        elif cycle_time <= (self.Tr + self.Tw + self.Tf):
            slope = (self.V0 - self.V1) / self.Tf
            self.V += slope * (cycle_time - self.Tr - self.Tw) + self.V1 + self.Voff

        # Low state: After (Tr + Tw + Tf)
        else:
            self.V += self.V0 + self.Voff


