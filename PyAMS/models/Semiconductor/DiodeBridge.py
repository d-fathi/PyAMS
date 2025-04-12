#-------------------------------------------------------------------------------
# Name:        Bridge of diode
# Author:      d.fathi
# Created:     03/04/2017
# Modified:    28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------



from pyams_lib import param,model
from models.Semiconductor.Diode import Diode


# Diode Bridge Model------------------------------------------------------------
class DiodeBridge(model):
    """
    This class implements a Diode Bridge model.

    A diode bridge, also known as a bridge rectifier, converts an AC input into a DC output.
    It consists of four diodes arranged in a bridge configuration.

    Attributes:
        D1, D2, D3, D4 (Diode): Four diodes forming the bridge.
        Iss (param): Saturation current for all diodes.
        Vt (param): Thermal voltage for all diodes.
    """
    def __init__(self, a, b, c, d):
        self.Iss = param(1.0e-12, 'A', 'Saturation current')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.D1 = Diode(a, b)
        self.D2 = Diode(c, b)
        self.D3 = Diode(d, c)
        self.D4 = Diode(d, a)

    def sub(self):
        self.D1.Iss += self.Iss
        self.D2.Iss += self.Iss
        self.D3.Iss += self.Iss
        self.D4.Iss += self.Iss
        self.D1.Vt += self.Vt
        self.D2.Vt += self.Vt
        self.D3.Vt += self.Vt
        self.D4.Vt += self.Vt
        return [self.D1, self.D2, self.D3, self.D4]

    def analog(self):
        pass