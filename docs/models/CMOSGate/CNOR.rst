

.. include:: ../importCSS.txt

CMOS NOR Gate
=============

:red:`Information`

A **CMOS NOR Gate** is a fundamental digital logic gate that implements logical NOR operation. The output is **HIGH (OH)** only when both inputs are **LOW (IL)**; otherwise, the output is **LOW (OL)**.

The gate operates based on voltage thresholds:

- If **both inputs are LOW (≤ IL)**, the output is **HIGH (OH)**.
- If **at least one input is HIGH (≥ IH)**, the output is **LOW (OL)**.
- Intermediate voltages are not handled explicitly in this model.

:red:`Ports`

- **In1**: First input terminal
- **In2**: Second input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS NOR Gate model** implements standard NOR logic behavior using voltage thresholds.

    Attributes:

    * **Vin1 (signal):** Input voltage at In1
    * **Vin2 (signal):** Input voltage at In2
    * **Vout (signal):** Output voltage at Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the NOR gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+------+
| Vin1 | Vin2 | Vout |
+======+======+======+
| LOW  | LOW  | HIGH |
+------+------+------+
| LOW  | HIGH | LOW  |
+------+------+------+
| HIGH | LOW  | LOW  |
+------+------+------+
| HIGH | HIGH | LOW  |
+------+------+------+



:red:`Python`

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class CNOR(model):
        """
        CMOS NOR Gate model using voltage threshold logic.
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
            """Defines the NOR gate behavior using voltage threshold logic."""
            if (self.Vin1 <= self.IL) and (self.Vin2 <= self.IL):
                self.Vout += self.OH  # Output HIGH when both inputs are LOW
            elif (self.Vin1 >= self.IH) or (self.Vin2 >= self.IH):
                self.Vout += self.OL  # Output LOW when at least one input is HIGH


:red:`Command Syntax`

The **syntax** for defining a CMOS NOR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CNOR

    # CNOR instance creation
    # Out, In1, In2: Connection points in the circuit
    nor_gate = CNOR(Out, In1, In2)
