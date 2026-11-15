#-------------------------------------------------------------------------------
# Name:        SwitchSPST (manual single pole, single throw switch)
# Author:      d.fathi
# Created:     15/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param, voltage, current


class SwitchSPST(model):
    """
    Manual single pole, single throw switch: one contact between p and n.

        p ----o   o---- n

    The position is the parameter `state`: closed (resistance Ron) when
    state >= 0.5, open (resistance Roff) otherwise.  It is set in the parameters
    of the part, and in the Live simulation it is changed while the circuit runs
    by the SPST switch widget of the symbol (parameter `state`).

    Terminals: SwitchSPST(p, n)
    Parameters:
        state  position: 1 = closed, 0 = open               0
        Ron    closed resistance (ohm)                      1e-3
        Roff   open resistance (ohm)                        1e9
    """
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        self.state = param(0.0, '', 'Position: 1 = closed, 0 = open')
        self.Ron = param(1e-3, 'Ω', 'Closed resistance')
        self.Roff = param(1e9, 'Ω', 'Open resistance')

    def analog(self):
        self.I += self.V / (self.Ron if self.state >= 0.5 else self.Roff)
