#-------------------------------------------------------------------------------
# Name:        VCVS (voltage-controlled voltage source, SPICE "E")
# Created:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams.lib import signal, param, model
from pyams.lib import voltage


# Voltage-Controlled Voltage Source --------------------------------------------
class VCVS(model):
    """
    Voltage-controlled voltage source (SPICE "E" element):

        v(p) - v(n) = Gain * ( v(cp) - v(cn) )

    The control port (cp, cn) draws no current.  The output port (p, n) is an
    ideal voltage source, so its current is set by the circuit around it.
    Typical uses: an ideal amplifier or buffer, an op-amp with a finite gain
    (Gain = 1e5), the secondary of an ideal transformer.

    Terminals: VCVS(p, n, cp, cn).

    Attributes:
        Vc (signal): control voltage v(cp) - v(cn)  (input, no current).
        V  (signal): output voltage v(p) - v(n).
        Gain (param): voltage gain, V/V (default 1).
    """
    def __init__(self, p, n, cp, cn):
        self.Vc = signal('in', voltage, cp, cn)
        self.V = signal('out', voltage, p, n)

        self.Gain = param(1.0, 'V/V', 'Voltage gain')

    def analog(self):
        self.V += self.Gain * self.Vc
