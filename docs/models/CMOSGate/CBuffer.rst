

.. include:: ../importCSS.txt

CMOS Buffer Gate
================

:red:`Information`

A **CMOS Buffer Gate** is used to **isolate** or **amplify** a signal while maintaining the same logical state at the output as the input. It acts as a **voltage buffer** with no change to the logical level, providing electrical isolation and signal amplification.

:red:`Ports`

- **Vin**: Input voltage terminal
- **Vout**: Output voltage terminal

:red:`Model`

The **CMOS Buffer Gate model** uses the same voltage at the output as the input.

    Attributes:

    * **Vin (signal):** Input voltage signal
    * **Vout (signal):** Output voltage signal
    * **IL (param):** Input LOW voltage threshold (default: 0.2V)
    * **IH (param):** Input HIGH voltage threshold (default: 3.2V)
    * **OL (param):** Output LOW voltage (default: 0.0V)
    * **OH (param):** Output HIGH voltage (default: 5.0V)

    Methods:

    * **analog()**: Defines the behavior of the CMOS buffer gate.

:red:`Logic Table`

+------+------+------+
| Vin  | Vout |      |
+======+======+======+
| LOW  | LOW  |      |
+------+------+------+
| HIGH | HIGH |      |
+------+------+------+



:red:`Python`

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class CBuffer(model):
        """
        CMOS Buffer Gate model to isolate/amplify signals.
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
            """Defines the behavior of the CMOS buffer gate."""
            if self.Vin <= self.IL:
                self.Vout += self.OL  # Output LOW when input is LOW
            elif self.Vin >= self.IH:
                self.Vout += self.OH  # Output HIGH when input is HIGH
            else:
                # Handling intermediate voltage (uncertain state)
                self.Vout += (self.OL + self.OH) / 2  # Output is a mid-point voltage


:red:`Command Syntax`

The **syntax** for defining a CMOS Buffer gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CBuffer

    # CBuffer instance creation
    # Out, In: Connection points in the circuit
    buffer_gate = CBuffer(Out, In)
