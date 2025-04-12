#-------------------------------------------------------------------------------
# Name:        High-Frequency BJT (PNP)
# Author:      dhiab fathi
# Created:     26/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal, model, param
from pyams_lib import voltage, current
from pyams_lib import explim, ddt

# High-Frequency BJT (PNP)-----------------------------------------------------
class PNP_HighFreq(model):
    """
    This class implements a high-frequency NPN BJT model.

    Attributes:
        Vbe (signal): Base-Emitter voltage.
        Vbc (signal): Base-Collector voltage.
        Vce (signal): Collector-Emitter voltage.
        Ic (signal): Collector current.
        Ib (signal): Base current.
        Ie (signal): Emitter current.
        Is (param): Transport saturation current.
        Bf (param): Forward current gain.
        Br (param): Reverse current gain.
        Vt (param): Thermal voltage.
        Vaf (param): Forward Early voltage.
        Var (param): Reverse Early voltage.
        Cbe (param): Base-Emitter junction capacitance.
        Cbc (param): Base-Collector junction capacitance.
        Tf (param): Transit time.

    Methods:
        analog(): Defines the current-voltage and high-frequency behavior of the BJT.
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
        self.Is = param(1.0e-16, 'A', 'Transport saturation current')
        self.Bf = param(100.0, ' ', 'Forward current gain')
        self.Br = param(1.0, ' ', 'Reverse current gain')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.Vaf = param(100.0, 'V', 'Forward Early voltage')
        self.Var = param(100.0, 'V', 'Reverse Early voltage')
        self.Cbe = param(1e-12, 'F', 'Base-Emitter junction capacitance')
        self.Cbc = param(1e-12, 'F', 'Base-Collector junction capacitance')
        self.Tf = param(1e-9, 's', 'Transit time')
        self.Ict = param(unit='A', description='Current collector transit')
        

    def analog(self):
        """Defines the high-frequency behavior of the PNP BJT."""
        Vt = self.Vt
        Icc = self.Is * (explim(-self.Vbe / Vt) - 1)
        Ice = self.Is * (explim(-self.Vbc / Vt) - 1)
        self.Ict += (Icc - Ice) * (1 - self.Vbc / self.Vaf - self.Vbe / self.Var)
        self.Ic += -self.Ict + Ice / self.Br + self.Cbc *ddt(self.Vbc) + self.Tf *ddt(self.Ict)
        self.Ib += -Ice / self.Br - Icc / self.Bf + self.Cbe *ddt(self.Vbe)
