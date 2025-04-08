#-------------------------------------------------------------------------------
# Name:        CMOS XNOR Gate
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      01/04/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage


# CMOS XNOR Gate Model ---------------------------------------------------------
class CXNOR(model):
    """
    This class models a **CMOS XNOR Gate.**

    The XNOR gate produces a HIGH (OH) output when both inputs are the same
    (either both HIGH or both LOW). Otherwise, the output is LOW (OL).

    :red:`Attributes`
    -----------------
    - **In1 (signal):** First input voltage
    - **In2 (signal):** Second input voltage
    - **Out (signal):** Output voltage

    - **IL (param):** Input LOW voltage threshold (default = 0.2V)
    - **IH (param):** Input HIGH voltage threshold (default = 3.2V)
    - **OL (param):** Output LOW voltage (default = 0.0V)
    - **OH (param):** Output HIGH voltage (default = 5.0V)

    :red:`Methods`
    --------------
    - **analog():** Defines the XNOR gate behavior.

    :red:`Logic Table`
    ------------------
    | In1  | In2  | Out  |
    |------|------|------|
    | LOW  | LOW  | HIGH |
    | LOW  | HIGH | LOW  |
    | HIGH | LOW  | LOW  |
    | HIGH | HIGH | HIGH |


    """

    def __init__(self, Out, In1, In2):
        # Signal declarations --------------------------------------------------
        self.In1 = signal('in', voltage, In1)
        self.In2 = signal('in', voltage, In2)
        self.Out = signal('out', voltage, Out)

        # Parameter declarations -----------------------------------------------
        self.IL = param(0.2, 'V', 'Input LOW voltage threshold')
        self.IH = param(3.2, 'V', 'Input HIGH voltage threshold')
        self.OL = param(0.0, 'V', 'Output LOW voltage')
        self.OH = param(5.0, 'V', 'Output HIGH voltage')

    def analog(self):
        """Defines the XNOR gate behavior using voltage threshold logic."""
        if (self.In1 <= self.IL and self.In2 <= self.IL) or (self.In1 >= self.IH and self.In2 >= self.IH):
            self.Out += self.OH  # Output HIGH when both inputs are the same
        else:
            self.Out += self.OL  # Output LOW when inputs are different



