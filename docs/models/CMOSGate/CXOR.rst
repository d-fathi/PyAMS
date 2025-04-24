

.. include:: ../importCSS.txt

CMOS XOR Gate
=============

:red:`Information`

A **CMOS XOR Gate** is a fundamental digital logic gate that implements logical exclusive disjunction. The output is **HIGH (OH)** when the inputs are different, and **LOW (OL)** when the inputs are the same.

The gate operates based on voltage thresholds:

- If the inputs are different (one HIGH and one LOW), the output is **HIGH (OH)**.
- If the inputs are the same (both HIGH or both LOW), the output is **LOW (OL)**.
- Intermediate voltages are not handled explicitly in this model.

:red:`Ports`

- **In1**: First input terminal
- **In2**: Second input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS XOR Gate model** implements standard XOR logic behavior using voltage thresholds.

    Attributes:

    * **Vin1 (signal):** Input voltage at In1
    * **Vin2 (signal):** Input voltage at In2
    * **Vout (signal):** Output voltage at Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the XOR gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+------+
| Vin1 | Vin2 | Vout |
+======+======+======+
| LOW  | LOW  | LOW  |
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

    class CXOR(model):
        """
        CMOS XOR Gate model using voltage threshold logic.
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
            """Defines the XOR gate behavior using voltage threshold logic."""
            if (self.Vin1 <= self.IL and self.Vin2 >= self.IH) or \
               (self.Vin1 >= self.IH and self.Vin2 <= self.IL):
                self.Vout += self.OH  # Output HIGH when inputs are different
            else:
                self.Vout += self.OL  # Output LOW when inputs are the same

:red:`Command Syntax`

The **syntax** for defining a CMOS XOR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CXOR

    # CXOR instance creation
    # Out, In1, In2: Connection points in the circuit
    xor_gate = CXOR(Out, In1, In2)