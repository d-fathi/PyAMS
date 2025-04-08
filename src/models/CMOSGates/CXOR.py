#-------------------------------------------------------------------------------
# Name:        CMOS XOR Gate
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      01/04/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage


# CMOS XOR Gate Model ----------------------------------------------------------
class CXOR(model):
    """
    This class models a **CMOS XOR Gate**.

    The XOR gate outputs **HIGH (OH)** when the inputs are different, and
    **LOW (OL)** when the inputs are the same.

    :red:`Attributes`
    -----------------
    - **Vin1 (signal):** First input voltage
    - **Vin2 (signal):** Second input voltage
    - **Vout (signal):** Output voltage

    - **IL (param):** Input LOW voltage threshold (default = 0.2V)
    - **IH (param):** Input HIGH voltage threshold (default = 3.2V)
    - **OL (param):** Output LOW voltage (default = 0.0V)
    - **OH (param):** Output HIGH voltage (default = 5.0V)

    :red:`Methods`
    --------------
    - **analog():** Defines the XOR gate behavior.

    :red:`Logic Table`
    ------------------
    | Vin1 | Vin2 | Vout |
    |------|------|------|
    | LOW  | LOW  | LOW  |
    | LOW  | HIGH | HIGH |
    | HIGH | LOW  | HIGH |
    | HIGH | HIGH | LOW  |

    """

    def __init__(self, Out, In1, In2):
        # Signal declarations --------------------------------------------------
        self.Vin1 = signal('in', voltage, In1)
        self.Vin2 = signal('in', voltage, In2)
        self.Vout = signal('out', voltage, Out)

        # Parameter declarations -----------------------------------------------
        self.IL = param(0.2, 'V', 'Input LOW voltage threshold')
        self.IH = param(3.2, 'V', 'Input HIGH voltage threshold')
        self.OL = param(0.0, 'V', 'Output LOW voltage')
        self.OH = param(5.0, 'V', 'Output HIGH voltage')

    def analog(self):
        """Defines the XOR gate behavior using voltage threshold logic."""
        if (self.Vin1 <= self.IL and self.Vin2 >= self.IH) or \
           (self.Vin1 >= self.IH and self.Vin2 <= self.IL):
            self.Vout += self.OH  # Output HIGH when inputs are different
        else:
            self.Vout += self.OL  # Output LOW when inputs are the same



