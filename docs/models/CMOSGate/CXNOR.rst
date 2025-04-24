

.. include:: ../importCSS.txt

CMOS XNOR Gate
==============

:red:`Information`

A **CMOS XNOR Gate** produces a **HIGH (OH)** output when both inputs are the same (either both **LOW (IL)** or both **HIGH (IH)**). Otherwise, the output is **LOW (OL)**.

:red:`Ports`

- **In1**: First input terminal
- **In2**: Second input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS XNOR Gate model** implements standard XNOR logic behavior using voltage thresholds.

    Attributes:

    * **In1 (signal):** Input voltage at terminal In1
    * **In2 (signal):** Input voltage at terminal In2
    * **Out (signal):** Output voltage at terminal Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the XNOR gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+------+
| In1  | In2  | Out  |
+======+======+======+
| LOW  | LOW  | HIGH |
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

    class CXNOR(model):
        """
        CMOS XNOR Gate model using voltage threshold logic.
        """
        def __init__(self, Out, In1, In2):
            # Signal declarations
            self.In1 = signal('in', voltage, In1)
            self.In2 = signal('in', voltage, In2)
            self.Out = signal('out', voltage, Out)

            # Parameter declarations
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

:red:`Command Syntax`

The **syntax** for defining a CMOS XNOR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CXNOR

    # CXNOR instance creation
    # Out, In1, In2: Connection points in the circuit
    xnor_gate = CXNOR(Out, In1, In2)


