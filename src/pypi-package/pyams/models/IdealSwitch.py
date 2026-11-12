#-------------------------------------------------------------------------------
# Name:        IdealSwitch (voltage-controlled, 0 V source when closed)
# Updated:     12/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from math import tanh
from pyams.lib import model, signal, param, voltage, current


class IdealSwitch(model):
    """
    Ideal voltage-controlled switch.

    Closed (Vc = V(cp) - V(cn) > Vt): p and n are joined by a 0 V voltage source,
    i.e. V(p) - V(n) = 0 exactly (a true short circuit, no Ron) and the current
    through it is an unknown of the circuit.
    Open  (Vc < Vt): the 0 V source is removed, the branch current is exactly 0
    (no Roff, no leakage).

    Terminals: IdealSwitch(p, n, cp, cn)
    Parameters:
        Vt  threshold voltage (V)                     0.5
        Vw  width of the smooth transition (V)         1e-3

    The branch equation is a continuous blend of the two states,

        s = 0.5 (1 + tanh((Vc - Vt)/Vw))        0 = open, 1 = closed
        s * (V(p) - V(n))  +  (1 - s) * I  =  0

    which is  V = 0  when s = 1  and  I = 0  when s = 0 (I in amperes, flowing
    p -> n inside the switch).  Because of the transition width the Newton
    iteration and the time step stay well behaved at the threshold.

    The current is available as ``I`` (setOutPuts("SW1.I")).

    Caution: like any ideal voltage source, a closed IdealSwitch must not form a
    loop with other ideal voltage sources or short an ideal source (the circuit
    has no solution); put a resistor in series.  An open IdealSwitch leaves its
    nodes floating if nothing else is connected to them.
    """
    def __init__(self, p, n, cp, cn):
        self.V = signal('out', voltage, p, n)          # the 0 V branch
        self.I = signal('in', current, p, n)           # its current
        self.Vr = signal('in', voltage, p, n)          # V(p) - V(n), read back
        self.Vc = signal('in', voltage, cp, cn)
        self.Vt = param(0.5, 'V', 'Threshold of the control voltage')
        self.Vw = param(1e-3, 'V', 'Width of the smooth transition')

    def analog(self):
        x = (self.Vc - self.Vt) / max(float(self.Vw), 1e-12)
        s = 0.5 * (1.0 + tanh(max(-30.0, min(30.0, x))))
        # branch equation  V(p) - V(n) - x_src = 0  with x_src = (1 - s) (V(p) - V(n) - I)
        self.V += (1.0 - s) * self.Vr + (1.0 - s) * self.I
