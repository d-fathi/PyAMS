

.. include:: ../importCSS.txt

CMOS NAND Gate
==============

:red:`Information`

A **CMOS NAND Gate** produces a **LOW (OL)** output only when both inputs are **HIGH (IH)**. Otherwise, the output remains **HIGH (OH)**.

The gate operates based on voltage thresholds:

- If at least one input is **LOW (≤ IL)**, the output is **HIGH (OH)**.
- If both inputs are **HIGH (≥ IH)**, the output is **LOW (OL)**.
- Intermediate voltages are not handled explicitly in this model.

:red:`Ports`

- **In1**: First input terminal
- **In2**: Second input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS NAND Gate model** implements standard NAND logic behavior using voltage thresholds.

    Attributes:

    * **Vin1 (signal):** Input voltage at In1
    * **Vin2 (signal):** Input voltage at In2
    * **Vout (signal):** Output voltage at Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the NAND gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+------+
| Vin1 | Vin2 | Vout |
+======+======+======+
| LOW  | LOW  | HIGH |
+------+------+------+
| LOW  | HIGH | HIGH |
+------+------+------+
| HIGH | LOW  | HIGH |
+------+------+------+
| HIGH | HIGH | LOW  |
+------+------+------+

:red:`Python`

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class CNAND(model):
        """
        CMOS NAND Gate model using voltage threshold logic.
        """
        def __init__(self, Out, In1, In2):
            # Signal declarations
            self.Vin1 = signal('in', voltage, In1)
            self.Vin2 = signal('in', voltage, In2)
            self.Vout = signal('out', voltage, Out)

            # Parameter declarations
            self.IL = param(0.2, 'V', 'Input LOW voltage threshold')
            self.IH = param(3.2, 'V', 'Input HIGH voltage threshold')
            self.OL = param(0.0, 'V', 'Output LOW voltage')
            self.OH = param(5.0, 'V', 'Output HIGH voltage')

        def analog(self):
            """Defines the NAND gate behavior using voltage threshold logic."""
            if (self.Vin1 <= self.IL) or (self.Vin2 <= self.IL):
                self.Vout += self.OH  # Output HIGH when at least one input is LOW
            elif (self.Vin1 >= self.IH) and (self.Vin2 >= self.IH):
                self.Vout += self.OL  # Output LOW when both inputs are HIGH

:red:`Command Syntax`

The **syntax** for defining a CMOS NAND gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CNAND

    # CNAND instance creation
    # Out, In1, In2: Connection points in the circuit
    nand_gate = CNAND(Out, In1, In2)

