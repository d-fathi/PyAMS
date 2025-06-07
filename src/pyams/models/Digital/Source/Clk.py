#-------------------------------------------------------------------------------
# Name:        Clk
# Author:      D.fathi
# Created:     05/05/2025 at 08:22:04
# Modified:    05/05/2025
# Copyright:   (c)PyAMS 2025
#-------------------------------------------------------------------------------

from pyams.lib import model, dsignal, param, time, digitalValue


# Clk model---------------------------------------------------------------------

class Clk(model):
    """
    This class models a clk Source.
    """

    def __init__(self, Out):

        # Digital signal declaration
        self.Out = dsignal(direction='out', port=Out, value='1')

        # Parameter declarations
        self.T = param(0.1, 'Sec', 'Period')


    def digital(self):
        """Defines the square wave voltage equation."""
        t = time  # Get the current simulation time
        cycle_time = t % self.T  # Time within the current period

        if cycle_time < (self.T / 2):
            self.Out += digitalValue('1') # High state
        else:
            self.Out += digitalValue('0')  # Low state