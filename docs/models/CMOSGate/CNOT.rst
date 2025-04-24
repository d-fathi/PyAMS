

.. include:: ../importCSS.txt

CMOS NOT Gate (Inverter)
========================

:red:`Information`

A **CMOS NOT Gate** (also known as an inverter) outputs the **inverse** of the input signal. If the input is **HIGH (IH)**, the output is **LOW (OL)**, and vice versa.

The gate operates based on voltage thresholds:

- If the input is **LOW (≤ IL)**, the output is **HIGH (OH)**.
- If the input is **HIGH (≥ IH)**, the output is **LOW (OL)**.
- Intermediate voltages are not handled explicitly in this model.

:red:`Ports`

- **In**: Input terminal
- **Out**: Output terminal

:red:`Model`

The **CMOS NOT Gate model** implements standard NOT logic behavior using voltage thresholds.

    Attributes:

    * **Vin (signal):** Input voltage at In
    * **Vout (signal):** Output voltage at Out
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the NOT gate behavior based on voltage thresholds.

:red:`Logic Table`

+------+------+
| Vin  | Vout |
+======+======+
| LOW  | HIGH |
+------+------+
| HIGH | LOW  |
+------+------+



:red:`Python`

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class CNOT(model):
        """
        CMOS NOT Gate (Inverter) model using voltage threshold logic.
        """
        def __init__(self, Out, In):
            # Signal declarations
            self.Vin = signal('in', voltage, In)
            self.Vout = signal('out', voltage, Out)

            # Parameter declarations
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

:red:`Command Syntax`

The **syntax** for defining a CMOS NOT gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CNOT

    # CNOT instance creation
    # Out, In: Connection points in the circuit
    not_gate = CNOT(Out, In)
