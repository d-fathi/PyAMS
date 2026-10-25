#-------------------------------------------------------------------------------
# Name:        VCCS (voltage-controlled current source, SPICE "G")
# Created:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import voltage, current


# Voltage-Controlled Current Source --------------------------------------------
class VCCS(model):
    """
    Voltage-controlled current source (SPICE "G" element, a transconductance):

        i(p -> n) = Gm * ( v(cp) - v(cn) )

    The current Gm*Vc flows through the source from p to n (it is taken out of
    node p and pushed into node n), like DCCurrent.  The control port draws no
    current.  Typical uses: the gm*vgs generator of a small-signal transistor
    model, a transconductance amplifier, a gyrator (two VCCS with opposite
    signs make an inductor from a capacitor).

    Terminals: VCCS(p, n, cp, cn).

    Attributes:
        Vc (signal): control voltage v(cp) - v(cn)  (input, no current).
        I  (signal): output current from p to n.
        Gm (param): transconductance in siemens (default 1 mS).
    """
    def __init__(self, p, n, cp, cn):
        self.Vc = signal('in', voltage, cp, cn)
        self.I = signal('out', current, p, n)

        self.Gm = param(1.0e-3, 'S', 'Transconductance')

    def analog(self):
        self.I += self.Gm * self.Vc
