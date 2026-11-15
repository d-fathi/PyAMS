#-------------------------------------------------------------------------------
# Name:        SwitchSPDT (manual single pole, double throw switch)
# Author:      d.fathi
# Created:     15/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param, voltage, current


class SwitchSPDT(model):
    """
    Manual single pole, double throw (changeover) switch: the common terminal com
    is joined to one of two terminals, no or nc.

              o---- no
        com --o
              o---- nc

    The position is the parameter `pos`: com is joined to no (resistance Ron) and
    disconnected from nc (Roff) when pos >= 0.5, the other way round otherwise
    (pos = 0, the rest position).  It is set in the parameters of the part, and
    in the Live simulation it is changed while the circuit runs by the SPDT
    switch widget of the symbol (parameter `pos`, upper position = no).

    Terminals: SwitchSPDT(com, no, nc)
    Parameters:
        pos    position: 1 = com-no, 0 = com-nc              0
        Ron    closed resistance (ohm)                      1e-3
        Roff   open resistance (ohm)                        1e9
    """
    def __init__(self, com, no, nc):
        self.Vno = signal('in', voltage, com, no)
        self.Ino = signal('out', current, com, no)
        self.Vnc = signal('in', voltage, com, nc)
        self.Inc = signal('out', current, com, nc)
        self.pos = param(0.0, '', 'Position: 1 = com-no, 0 = com-nc')
        self.Ron = param(1e-3, 'Ω', 'Closed resistance')
        self.Roff = param(1e9, 'Ω', 'Open resistance')

    def analog(self):
        up = self.pos >= 0.5
        self.Ino += self.Vno / (self.Ron if up else self.Roff)
        self.Inc += self.Vnc / (self.Roff if up else self.Ron)
