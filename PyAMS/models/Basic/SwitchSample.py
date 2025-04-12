#-------------------------------------------------------------------------------
# Name:        Switch Sample
# Author:      d.fathi
# Created:     10/09/2024
# Modified:    24/03/2025
# Copyright:   (c) PyAMS 2024
#-------------------------------------------------------------------------------

from pyams_lib import model,signal,param
from pyams_lib import voltage,current
from models.Basic.Resistor import Resistor


# Voltage-Controlled Switch Sample Model
class SwitchSample(model):
    """
    This class implements a Voltage-Controlled Switch Sample model.

    The switch operates based on the control voltage (Vc). 
    It uses an internal resistor model (Rs) whose resistance changes 
    depending on the control voltage level.

    Attributes:
        Vc (signal): Control voltage signal that determines switch state.
        Rs (Resistor): Internal resistor model that simulates switch resistance.
        Von (param): Voltage threshold to turn the switch ON (default: 5V).
        Voff (param): Voltage threshold to turn the switch OFF (default: -5V).
        Ron (param): Resistance value when switch is ON (default: 10Ω).
        Roff (param): Resistance value when switch is OFF (default: 1MΩ).
        Rint (param): Initial resistance value (default: 10Ω).

    Methods:
        sub(): Initializes the internal resistor model.
        analog(): Dynamically updates resistance based on control voltage.
    """
    
    def __init__(self, c, p, n):
        # Signal declarations
        self.Vc = signal('in', voltage, c)

        # Resistor model
        self.Rs = Resistor(p, n)

        # Parameter declarations
        self.Von = param(5.0, 'V', 'Voltage for switch ON')
        self.Voff = param(-5.0, 'V', 'Voltage for switch OFF')
        self.Ron = param(10.0, 'Ω', 'ON-state resistance')
        self.Roff = param(1e+6, 'Ω', 'OFF-state resistance')
        self.Rint = param(10.0, 'Ω', 'Initial resistance value')

    def sub(self):
        """Initializes the internal resistor model with default resistance."""
        self.Rs.R = self.Rint
        return [self.Rs]

    def analog(self):
        """Updates the resistance value based on control voltage."""
        if self.Vc >= self.Von:
            self.Rs.R = self.Ron  # Switch ON

        if self.Vc <= self.Voff:
            self.Rs.R = self.Roff  # Switch OFF
