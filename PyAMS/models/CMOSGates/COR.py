#-------------------------------------------------------------------------------
# Name:        OR
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      01/04/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage

# CMOS OR Gate Model ----------------------------------------------------------
class COR(model):
    """
    This class models a **CMOS OR Gate**.

    The gate follows digital logic behavior:
    - If **both inputs are LOW (≤ IL)**, the output is **LOW (OL)**.
    - If **at least one input is HIGH (≥ IH)**, the output is **HIGH (OH)**.
    - Intermediate voltages are not handled explicitly in this model.

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
    - **analog():** Defines the OR gate behavior.

    :red:`Logic Table`
    ------------------
    | In1  | In2  | Out  |
    |------|------|------|
    | LOW  | LOW  | LOW  |
    | LOW  | HIGH | HIGH |
    | HIGH | LOW  | HIGH |
    | HIGH | HIGH | HIGH |

    """

    def __init__(self, O, I1, I2):
        # Signal declarations --------------------------------------------------
        self.In1 = signal('in', voltage, I1, '0')
        self.In2 = signal('in', voltage, I2, '0')
        self.Out = signal('out', voltage, O, '0')

        # Parameter declarations -----------------------------------------------
        self.IL = param(0.2, 'V', 'Input LOW voltage threshold')
        self.IH = param(3.2, 'V', 'Input HIGH voltage threshold')
        self.OL = param(0.0, 'V', 'Output LOW voltage')
        self.OH = param(5.0, 'V', 'Output HIGH voltage')

    def analog(self):
        """Defines the OR gate behavior using voltage threshold logic."""
        if (self.In1 <= self.IL) and (self.In2 <= self.IL):
            self.Out += self.OL  # Output LOW if both inputs are LOW
        elif (self.In1 >= self.IH) or (self.In2 >= self.IH):
            self.Out += self.OH  # Output HIGH if at least one input is HIGH



