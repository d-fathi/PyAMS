#-------------------------------------------------------------------------------
# Name:        Transformer with two ports
# Author:      Dhiabi Fathi
# Created:     06/03/2017
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage, current
from pyams_lib import ddt

# Mutual Inductor (Transformer) Model
class Transformer(model):
    """
    This class models a Mutual Inductor (Transformer) using behavioral modeling.

    The transformer consists of primary and secondary windings with inductance 
    values (Lp and Ls) and mutual inductance (M). The voltage and current relationships 
    follow the mutual inductance equations:

        Vp = Lp * (dIp/dt) + M * (dIs/dt)
        Vs = Ls * (dIs/dt) + M * (dIp/dt)

    Where:
    - Vp: Primary voltage
    - Ip: Primary current
    - Vs: Secondary voltage
    - Is: Secondary current
    - Lp: Primary inductance
    - Ls: Secondary inductance
    - M: Mutual inductance

    Attributes:
        Vp (signal): Primary voltage.
        Ip (signal): Primary current.
        Vs (signal): Secondary voltage.
        Is (signal): Secondary current.
        Lp (param): Primary inductance (default: 1H).
        Ls (param): Secondary inductance (default: 1H).
        M (param): Mutual inductance (default: 0.5H).

    Methods:
        analog(): Defines the mutual inductance relationship between primary and secondary windings.
    """

    def __init__(self, p1, n1, p2, n2):
        # Signal declarations
        self.Vp = signal('out', voltage, p1, n1)
        self.Ip = signal('in', current, p1, n1)
        self.Vs = signal('out', voltage, p2, n2)
        self.Is = signal('in', current, p2, n2)

        # Parameter declarations
        self.Lp = param(1.0, 'H', 'Primary inductance value')
        self.Ls = param(1.0, 'H', 'Secondary inductance value')
        self.M = param(0.5, 'H', 'Mutual inductance value')

    def analog(self):
        """Defines the voltage-current equations for a mutual inductor."""
        self.Vp += self.Lp * ddt(self.Ip) + self.M * ddt(self.Is)  # Primary winding equation
        self.Vs += self.Ls * ddt(self.Is) + self.M * ddt(self.Ip)  # Secondary winding equation



