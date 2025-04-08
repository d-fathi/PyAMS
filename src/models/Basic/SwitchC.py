#-------------------------------------------------------------------------------
# Name:        Current-Controlled Switch Model
# Author:      d.fathi
# Created:     11/09/2024
# Modified:    24/03/2025
# Copyright:   (c) PyAMS 2024
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage, current
from models.Basic.Resistor import Resistor

# Current-Controlled Switch Model
class SwitchC(model):
    """
    This class implements a Current-Controlled Switch model.

    The switch operates based on the control current (Ic). 
    It uses an internal resistor model (Rs) whose resistance changes 
    depending on the control current level.

    Attributes:
        Ic (signal): Control current signal that determines switch state.
        Rs (Resistor): Internal resistor model that simulates switch resistance.
        Ion (param): Current threshold to turn the switch ON (default: 1mA).
        Ioff (param): Current threshold to turn the switch OFF (default: -1mA).
        Ron (param): Resistance value when switch is ON (default: 10Ω).
        Roff (param): Resistance value when switch is OFF (default: 1MΩ).
        Rint (param): Initial resistance value (default: 10Ω).

    Methods:
        sub(): Initializes the internal resistor model.
        analog(): Dynamically updates resistance based on control current.
    """
    
    def __init__(self, pc, nc, p, n):
        # Signal declarations
        self.Ic = signal('in', current, pc, nc)

        # Resistor model
        self.Rs = Resistor(p, n)

        # Parameter declarations
        self.Ion = param(1e-3, 'A', 'Current for switch ON')
        self.Ioff = param(-1e-3, 'A', 'Current for switch OFF')
        self.Ron = param(10.0, 'Ω', 'ON-state resistance')
        self.Roff = param(1e+6, 'Ω', 'OFF-state resistance')
        self.Rint = param(10.0, 'Ω', 'Initial resistance value')

    def sub(self):
        """Initializes the internal resistor model with default resistance."""
        self.Rs.R = self.Rint
        return [self.Rs]

    def analog(self):
        """Updates the resistance value based on control current."""
        if self.Ic >= self.Ion:
            self.Rs.R = self.Ron  # Switch ON

        if self.Ic <= self.Ioff:
            self.Rs.R = self.Roff  # Switch OFF


