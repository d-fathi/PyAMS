

.. include:: ../importCSS.txt

CMOS AND Gate
=============

:red:`Information`

A **CMOS AND Gate** is a fundamental digital logic gate that implements logical conjunction. The output is HIGH (OH) only when both inputs are HIGH (IH); otherwise, the output is LOW (OL).

The gate operates based on voltage thresholds:

- If either input is **LOW (\u2264 IL)**, the output is **LOW (OL)**.
- If both inputs are **HIGH (\u2265 IH)**, the output is **HIGH (OH)**.
- Intermediate voltages are not handled explicitly in this model.

:red:`Ports`

- **In1**: First input terminal
- **In2**: Second input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS AND Gate model** implements standard AND logic behavior using voltage thresholds.

    Attributes:

    * **Vin1 (signal):** Input voltage at In1
    * **Vin2 (signal):** Input voltage at In2
    * **Vout (signal):** Output voltage at Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the AND gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+------+
| Vin1 | Vin2 | Vout |
+======+======+======+
| LOW  | LOW  | LOW  |
+------+------+------+
| LOW  | HIGH | LOW  |
+------+------+------+
| HIGH | LOW  | LOW  |
+------+------+------+
| HIGH | HIGH | HIGH |
+------+------+------+


:red:`Python`

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class CAND(model):
        """
        CMOS AND Gate model using voltage threshold logic.
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
            """Defines the AND gate behavior using voltage threshold logic."""
            if (self.Vin1 <= self.IL) or (self.Vin2 <= self.IL):
                self.Vout += self.OL  # Output LOW if either input is LOW
            elif (self.Vin1 >= self.IH) and (self.Vin2 >= self.IH):
                self.Vout += self.OH  # Output HIGH if both inputs are HIGH

:red:`Command Syntax`

The **syntax** for defining a CMOS AND gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CAND

    # CAND instance creation
    # Out, In1, In2: Connection points in the circuit
    and_gate = CAND(Out, In1, In2)

