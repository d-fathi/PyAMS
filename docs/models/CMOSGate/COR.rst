

.. include:: ../importCSS.txt

CMOS OR Gate
=============

:red:`Information`

A **CMOS OR Gate** is a fundamental digital logic gate that implements logical disjunction. The output is HIGH (OH) if at least one input is HIGH (IH); otherwise, the output is LOW (OL).

The gate operates based on voltage thresholds:

- If **both inputs are LOW (\u2264 IL)**, the output is **LOW (OL)**.
- If **at least one input is HIGH (\u2265 IH)**, the output is **HIGH (OH)**.
- Intermediate voltages are not handled explicitly in this model.

:red:`Ports`

- **In1**: First input terminal
- **In2**: Second input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS OR Gate model** implements standard OR logic behavior using voltage thresholds.

    Attributes:

    * **In1 (signal):** Input voltage at In1
    * **In2 (signal):** Input voltage at In2
    * **Out (signal):** Output voltage at Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the OR gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+------+
| In1  | In2  | Out  |
+======+======+======+
| LOW  | LOW  | LOW  |
+------+------+------+
| LOW  | HIGH | HIGH |
+------+------+------+
| HIGH | LOW  | HIGH |
+------+------+------+
| HIGH | HIGH | HIGH |
+------+------+------+



:red:`Python`

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class COR(model):
        """
        CMOS OR Gate model using voltage threshold logic.
        """
        def __init__(self, O, I1, I2):
            # Signal declarations
            self.In1 = signal('in', voltage, I1, '0')
            self.In2 = signal('in', voltage, I2, '0')
            self.Out = signal('out', voltage, O, '0')

            # Parameter declarations
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


:red:`Command Syntax`

The **syntax** for defining a CMOS OR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import COR

    # COR instance creation
    # O, I1, I2: Connection points in the circuit
    or_gate = COR(O, I1, I2)
