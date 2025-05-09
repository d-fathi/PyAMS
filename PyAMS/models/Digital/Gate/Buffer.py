#-------------------------------------------------------------------------------
# Name:        CMOS Buffer Gate
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      01/04/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage


#Buffer Gate Model -------------------------------------------------------
class Buffer(model):
    """
    
    """

    def __init__(self, Out, In):
        # Signal declarations --------------------------------------------------
        self.Vin = signal('in', voltage, In)
        self.Vout = signal('out', voltage, Out)

        # Parameter declarations -----------------------------------------------
        self.IL = param(0.2, 'V', 'Input LOW voltage threshold')
        self.IH = param(3.2, 'V', 'Input HIGH voltage threshold')
        self.OL = param(0.0, 'V', 'Output LOW voltage')
        self.OH = param(5.0, 'V', 'Output HIGH voltage')

    def analog(self):
        """Defines the behavior of the CMOS buffer gate."""
        if self.Vin <= self.IL:
            self.Vout += self.OL  # Output LOW when input is LOW
        elif self.Vin >= self.IH:
            self.Vout += self.OH  # Output HIGH when input is HIGH
        else:
            # Handling intermediate voltage (uncertain state)
            self.Vout += (self.OL + self.OH) / 2  # Output is a mid-point voltage
