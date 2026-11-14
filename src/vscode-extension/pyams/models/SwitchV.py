#-------------------------------------------------------------------------------
# Name:        SwitchV (switch as a 0 V source / open circuit)
# Author:      d.fathi
# Created:     10/09/2020
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from math import tanh
from pyams.lib import model, signal, param, voltage, current


class SwitchV(model):
    """
    Voltage-controlled switch that is an ideal short circuit when closed:
    while Vc = V(cp) - V(cn) is above the threshold Vt, p and n are joined by a
    0 V voltage source (V(p) - V(n) = 0 exactly, zero resistance); otherwise the
    branch is removed (open circuit: the branch current is zero).

    The branch current is an unknown of the circuit (like the current of a
    voltage source), so it is also available as the signal ``I`` (it is the
    switch current, p -> n): setOutPuts("SW1.I").

        branch equation:   V(p) - V(n) = (1 - s) * Roff * I
        s = 0.5 (1 + tanh((Vc - Vt) / Vw))        1 = closed, 0 = open

    s = 1 gives V = 0 (the 0 V source), s = 0 gives I = V/Roff, i.e. an open
    circuit as seen by the rest of the circuit (Roff is large).  The steep
    smooth transition of width Vw keeps Newton's method and the time step well
    behaved.

    Terminals: SwitchV(p, n, cp, cn)
    Parameters:
        Vt    threshold voltage (V)                         0.5
        Vw    width of the transition (V)                   1e-3
        Roff  resistance of the removed branch (ohm)        1e12
    Because the closed switch is an ideal voltage source, do not put it in a loop
    of ideal voltage sources (and keep a resistance in series, as with any 0 V
    source).
    """
    def __init__(self, p, n, cp, cn):
        self.V = signal('out', voltage, p, n)       # branch equation V = (1 - s) Roff I
        self.I = signal('in', current, p, n)        # branch current (unknown)
        self.Vc = signal('in', voltage, cp, cn)
        self.Vt = param(0.5, 'V', 'Threshold of the control voltage')
        self.Vw = param(1e-3, 'V', 'Width of the smooth transition')
        self.Roff = param(1e12, 'Ω', 'Resistance of the removed (open) branch')

    def analog(self):
        x = (self.Vc - self.Vt) / max(float(self.Vw), 1e-12)
        if x >= 30.0:                                # closed: exactly a 0 V source
            self.V += 0.0
            return
        s = 0.5 * (1.0 + tanh(max(-30.0, x)))
        self.V += (1.0 - s) * self.Roff * self.I
