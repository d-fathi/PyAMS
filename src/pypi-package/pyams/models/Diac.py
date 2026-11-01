#-------------------------------------------------------------------------------
# Name:        Diac (bidirectional breakover diode)
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import sqrt
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting


def _pos(x, eps=0.05):
    """Smooth max(x, 0)."""
    return 0.5 * (x + sqrt(x * x + eps * eps))


# Diac Model ----------------------------------------------------------------------
class Diac(model):
    """
    This class implements a diac: a two-terminal, symmetrical device that blocks
    until the voltage reaches the breakover voltage, then switches to a
    low-voltage conducting state, and stays on until the current falls below the
    holding current.

    The device has memory (hysteresis), so the model keeps a state, off or on:

        off :  I = V / Roff                       (leakage, blocking)
        on  :  I = sign(V) * (|V| - Vh) / Ron     (conducting, for |V| > Vh)

        off -> on   when |V| >= Vbo               (breakover)
        on  -> off  when |I| <  Ih                (current below the holding current)

    The state changes only when a time step is accepted (never inside a step
    that may be rejected), so within a step the diac is an ordinary smooth
    nonlinear resistor.  The turn-off therefore happens at about
    |V| = Vh + Ron * Ih.

    Why not a continuous S-shaped I-V curve?  The voltage is a single-valued
    function of the current, but at the breakover point the Newton iteration of
    an implicit solver cannot cross the fold of such a curve (it needs steps of
    picoseconds for as long as the voltage creeps up to Vbo).  A switching
    state avoids that, at the price of a current that jumps when the diac
    changes state.

    Attributes:
        V (signal): Input voltage signal across the diac, between nodes (p, n).
        I (signal): Output current signal through the diac, between nodes (p, n).
        Vbo (param): Breakover voltage (default: 36 V).
        Vh (param): On-state voltage at zero current extrapolation (default: 16 V).
        Ih (param): Holding current (default: 1 mA).
        Ron (param): Dynamic resistance when conducting (default: 34 ohm).
        Roff (param): Resistance when blocking (default: 4 Mohm).

    Methods:
        analog(): Defines the current of the present state and its transitions.

    Note: the state is updated when a transient step is accepted, so the
    transient analysis is needed (in a DC analysis the diac stays off).  The
    circuit must contain a capacitor or an inductor, as usual for an oscillator.
    """
    def __init__(self, p, n):
        # Signals declarations---------------------------------------------------
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        # Parameter declarations-------------------------------------------------
        self.Vbo = param(36.0, 'V', 'Breakover voltage')
        self.Vh = param(16.0, 'V', 'On-state voltage (zero-current extrapolation)')
        self.Ih = param(1.0e-3, 'A', 'Holding current')
        self.Ron = param(34.0, 'Ω', 'On-state dynamic resistance')
        self.Roff = param(4.0e6, 'Ω', 'Off-state resistance')
        # State (hysteresis)
        self._on = False

    def analog(self):
        v = self.V
        ddt(v)              # makes the diac a stateful element: analog() is then
                            # also called, once, for every accepted time point
        if accepting():
            av = abs(v)
            if self._on:
                if (av - self.Vh) / self.Ron < self.Ih:
                    self._on = False
            elif av >= self.Vbo:
                self._on = True
            return
        if self._on:
            self.I += (_pos(v - self.Vh) - _pos(-v - self.Vh)) / self.Ron
        else:
            self.I += v / self.Roff
