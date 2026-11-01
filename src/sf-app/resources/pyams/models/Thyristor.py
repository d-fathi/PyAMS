#-------------------------------------------------------------------------------
# Name:        Thyristor (SCR, silicon controlled rectifier)
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import exp
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time


def _limexp(x, xmax=40.0):
    """exp(x) that continues linearly after xmax (no overflow)."""
    if x <= xmax:
        return exp(x)
    return exp(xmax) * (1.0 + x - xmax)


def _pos(x):
    return x if x > 0.0 else 0.0


# Thyristor Model ---------------------------------------------------------------
class Thyristor(model):
    """
    Silicon controlled rectifier (SCR): a four-layer device that blocks in both
    directions until it is triggered, then conducts like a diode and stays on
    (latches) after the trigger is removed, until its current falls below the
    holding current.

    Terminals (a, g, k): anode, gate, cathode.

    States (a latch, changed only when a time point is accepted - see Diac):

      OFF  Iak = Vak / Roff  (Vak > 0),  Vak / Rrev (Vak < 0)   (blocks, leakage)
      ON   Iak = Vak / Roff + (Vak - Von)+ / Ron    (conducts: Von = threshold
                                                      voltage, Ron = slope)
      reverse breakdown (any state)  Iak = -(-Vak - Vrb)+ / Rrb  for Vak < -Vrb

      OFF -> ON  when  Vak > 0 and Vak >= Vbo * (1 - Ig / Igt)
                 i.e. the forward breakover voltage falls linearly with the gate
                 current (Vbo at Ig = 0, zero at Ig = Igt): at Ig >= Igt the SCR
                 turns on at any positive Vak (gate trigger)
      latching: after the turn-on the anode current must reach the latching
                 current Il (> Ih) before the gate is removed; until then the
                 SCR falls back to OFF as soon as I < Il (gate not driven)
      ON -> OFF  when  the anode current falls below the holding current Ih
                 (this includes a reversed anode voltage); while the gate is
                 still driven (Ig >= Igt) and Vak > 0 it stays on

    The gate-cathode junction is a diode, Ig = Is (exp(Vgk / N Vt) - 1), so the
    gate must be driven through a resistor (like a real SCR).

    Attributes:
        Von (param): on-state threshold voltage (default 1.0 V).
        Ron (param): on-state slope resistance (default 0.05 ohm).
        Roff (param): forward blocking resistance (default 10 Mohm).
        Rrev (param): reverse blocking resistance (default 10 Mohm).
        Vrb (param): reverse breakdown voltage (default 1000 V), Rrb (param):
                     slope resistance of the reverse breakdown (default 1 ohm).
        Igt (param): gate trigger current (default 2 mA).
        Ih (param): holding current (default 10 mA).
        Il (param): latching current (default 20 mA).
        Vbo (param): forward breakover voltage (default 1000 V).
        Is, N, Vt: gate-cathode junction diode (1e-14 A, 1, 25 mV).
    """
    def __init__(self, a, g, k):
        self.V = signal('in', voltage, a, k)       # anode-cathode
        self.I = signal('out', current, a, k)
        self.Vg = signal('in', voltage, g, k)      # gate-cathode
        self.Ig = signal('out', current, g, k)

        self.Von = param(1.0, 'V', 'On-state threshold voltage')
        self.Ron = param(0.05, 'Ω', 'On-state slope resistance')
        self.Roff = param(1.0e7, 'Ω', 'Forward blocking resistance')
        self.Rrev = param(1.0e7, 'Ω', 'Reverse blocking resistance')
        self.Vrb = param(1000.0, 'V', 'Reverse breakdown voltage')
        self.Rrb = param(1.0, 'Ω', 'Reverse breakdown slope resistance')
        self.Igt = param(2.0e-3, 'A', 'Gate trigger current')
        self.Ih = param(10.0e-3, 'A', 'Holding current')
        self.Il = param(20.0e-3, 'A', 'Latching current')
        self.Vbo = param(1000.0, 'V', 'Forward breakover voltage')
        self.Is = param(1.0e-14, 'A', 'Gate junction saturation current')
        self.N = param(1.0, ' ', 'Gate junction emission coefficient')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self._on = False                           # latch state
        self._latched = False                      # has I reached Il since turn-on
        self._tlast = 0.0

    def analog(self):
        v = self.V
        ig = self.Is * (_limexp(self.Vg / (self.N * self.Vt)) - 1.0)
        ddt(v)              # makes the element stateful: analog() is then also
                            # called, once, for every accepted time point
        if accepting():
            t = float(time)
            if t < self._tlast:                    # a new run starts
                self._on = False
                self._latched = False
            self._tlast = t
            if self._on:
                i = v / self.Roff + _pos(v - self.Von) / self.Ron
                if i >= self.Il:
                    self._latched = True
                # a gate that is still driven (Ig >= Igt) keeps it on at low
                # current, as long as the anode is positive
                hold = self.Ih if self._latched else self.Il
                if v <= 0.0 or (ig < self.Igt and i < hold):
                    self._on = False
            elif v > 0.0 and v >= self.Vbo * (1.0 - min(ig / self.Igt, 1.0)):
                self._on = True
                self._latched = False
            return
        i = v / self.Roff if v >= 0.0 else v / self.Rrev
        if self._on:
            i += _pos(v - self.Von) / self.Ron
        i -= _pos(-v - self.Vrb) / self.Rrb          # reverse breakdown
        self.I += i
        self.Ig += ig
