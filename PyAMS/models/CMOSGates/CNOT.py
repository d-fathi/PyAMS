#-------------------------------------------------------------------------------
# Name:        CMOS NOT Gate
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      01/04/2025
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from pyams_lib import model, signal, param
from pyams_lib import voltage


# CMOS NOT Gate Model ----------------------------------------------------------
class CNOT(model):
    """
    This class models a **CMOS NOT Gate (Inverter).**

    The NOT gate outputs the **inverse** of the input signal.
    If the input is HIGH (IH), the output is LOW (OL), and vice versa.

    :red:`Attributes`
    -----------------
    - **Vin (signal):** Input voltage
    - **Vout (signal):** Output voltage

    - **IL (param):** Input LOW voltage threshold (default = 0.2V)
    - **IH (param):** Input HIGH voltage threshold (default = 3.2V)
    - **OL (param):** Output LOW voltage (default = 0.0V)
    - **OH (param):** Output HIGH voltage (default = 5.0V)

    :red:`Methods`
    --------------
    - **analog():** Defines the NOT gate behavior.

    :red:`Logic Table`
    ------------------
    | Vin  | Vout |
    |------|------|
    | LOW  | HIGH |
    | HIGH | LOW  |


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
        """Defines the NOT gate behavior using voltage threshold logic."""
        if self.Vin <= self.IL:
            self.Vout += self.OH  # Output HIGH when input is LOW
        elif self.Vin >= self.IH:
            self.Vout += self.OL  # Output LOW when input is HIGH




