#-------------------------------------------------------------------------------
# Name:        DiodeBridge
# Author:      d.fathi
# Created:     15/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, param
from pyams.models.Diode import Diode

# Full-wave diode bridge (four diodes, hierarchical model)----------------------
class DiodeBridge(model):
    """
    Full-wave diode bridge rectifier built from four Diode sub-models
    (described in subcircuit()).

    Terminals:
        ac1, ac2 : AC input terminals.
        plus     : positive DC output.
        minus    : negative DC output.

    Parameters (shared by the four diodes):
        Iss (param): Saturation current (default: 1.0e-15 A).
        Vt  (param): Thermal voltage (default: 0.025 V).
        n   (param): Ideality factor (default: 1).

    Sub-models: D1 (ac1->plus), D2 (ac2->plus), D3 (minus->ac1), D4 (minus->ac2).
    Their currents can be recorded, e.g. setOutPuts("B1.D1.I").
    Output voltage: V(plus,minus) = |V(ac1,ac2)| - 2*Vd.
    """
    def __init__(self, ac1, ac2, plus, minus):
        self.ac1, self.ac2, self.plus, self.minus = ac1, ac2, plus, minus
        self.Iss = param(1.0e-15, 'A', 'Saturation current')
        self.Vt = param(0.025, 'V', 'Thermal voltage')
        self.n = param(1, ' ', 'The ideality factor')

    def subcircuit(self):
        p = dict(Iss=self.Iss, Vt=self.Vt, n=self.n)
        self.add("D1", Diode(self.ac1, self.plus), **p)
        self.add("D2", Diode(self.ac2, self.plus), **p)
        self.add("D3", Diode(self.minus, self.ac1), **p)
        self.add("D4", Diode(self.minus, self.ac2), **p)
