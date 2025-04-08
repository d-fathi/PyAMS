#-------------------------------------------------------------------------------
# Name:        Simple BJT (NPN)
# Author:      d.Fathi
# Created:     01/05/2015
# Modified:    18/03/2023
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from pyams_lib import signal, model, param
from pyams_lib import voltage, current
from pyams_lib import explim

# Simple BJT (NPN) Model------------------------------------------------------
class NPN(model):
    """
    This class implements an NPN Bipolar Junction Transistor (BJT) model.

    An NPN transistor is a three-terminal semiconductor device used for amplification
    and switching applications. It consists of a collector (c), base (b), and emitter (e).

    Attributes:
        Vbe (signal): Base-emitter voltage.
        Vbc (signal): Base-collector voltage.
        Vce (signal): Collector-emitter voltage.
        Ic (signal): Collector current.
        Ib (signal): Base current.
        Ie (signal): Emitter current.
        Nf (param): Forward current emission coefficient (default: 1.0).
        Nr (param): Reverse current emission coefficient (default: 1.0).
        Is (param): Transport saturation current (default: 1.0e-16 A).
        area (param): Device area scaling factor (default: 1.0).
        Br (param): Ideal maximum reverse beta (default: 1.0).
        Bf (param): Ideal maximum forward beta (default: 100.0).
        Vt (param): Thermal voltage (default: 0.025 V).
        Var (param): Reverse Early voltage (default: 1e3 V).
        Vaf (param): Forward Early voltage (default: 1e3 V).
        gmin (param): Minimum conductance (default: 1e-12 1/Ohm).

    Methods:
        analog(): Defines the transistor behavior using the Ebers-Moll model:
            - Icc = Is * (exp(Vbe / (Nf * Vt)) - 1)
            - Ice = Is * (exp(Vbc / (Nr * Vt)) - 1)
            - Ict = (Icc - Ice) * (1 - Vbc / Vaf - Vbe / Var)
            - Ic = Ict - Ice / Br + gmin * Vbc
            - Ib = Ice / Br + Icc / Bf
            - Ie = -Ict - Icc / Bf + gmin * Vbe
    """
    def __init__(self, c, b, e):
        # Signals-------------------------------------------------------------
        self.Vbe = signal('in', voltage, b, e)
        self.Vbc = signal('in', voltage, b, c)
        self.Vce = signal('in', voltage, c, e)
        self.Ic = signal('out', current, c)
        self.Ib = signal('out', current, b)
        self.Ie = signal('out', current, e)

        # Parameters----------------------------------------------------------
        self.Nf = param(1.0, ' ', 'Forward current emission coefficient')
        self.Nr = param(1.0, ' ', 'Reverse current emission coefficient')
        self.Is = param(1.0e-16, 'A', 'Transport saturation current')
        self.area = param(1.0, ' ', 'Area')
        self.Br = param(1.0, ' ', 'Ideal maximum reverse beta')
        self.Bf = param(100.0, ' ', 'Ideal maximum forward beta')
        self.Vt = param(0.025, 'V', 'Voltage equivalent of temperature')
        self.Var = param(1e+3, 'V', 'Reverse Early voltage')
        self.Vaf = param(1e+3, 'V', 'Forward Early voltage')
        self.gmin = param(1e-12, '1/Ohm', 'Minimum conductance')

    def analog(self):
        """Defines the NPN transistor current-voltage relationships using the Ebers-Moll model."""
        Vt = self.Vt
        Icc = self.Is * (explim(self.Vbe / (self.Nf * Vt)) - 1)
        Ice = self.Is * (explim(self.Vbc / (self.Nr * Vt)) - 1)
        Ict = (Icc - Ice) * (1 - self.Vbc / self.Vaf - self.Vbe / self.Var)
        self.Ic += Ict - Ice / self.Br + self.gmin * self.Vbc
        self.Ib += Ice / self.Br + Icc / self.Bf
        self.Ie += -Ict - Icc / self.Bf + self.gmin * self.Vbe

