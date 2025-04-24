

.. include:: ../importCSS.txt

Diode Bridge
===========

:red:`Information`

A **Diode Bridge**, also known as a **Bridge Rectifier**, is an electrical circuit used to convert an **AC input voltage** into a **DC output voltage**. It consists of **four diodes** arranged in a bridge configuration to efficiently rectify alternating current.

The bridge rectifier works by allowing current to flow in one direction, ensuring that the output voltage always has the same polarity regardless of the input.

:red:`Ports`

- **a**: AC input terminal 1
- **b**: Positive DC output
- **c**: AC input terminal 2
- **d**: Negative DC output

:red:`Model`

The **Diode Bridge model** consists of four diodes arranged in a bridge configuration.

    The bridge rectifier ensures full-wave rectification by directing current through the appropriate diodes based on the input polarity.

    Attributes:

       * **D1, D2, D3, D4** (Diode): The four diodes forming the bridge.
       * **Iss** (param): Saturation current of the diodes, default is **1.0e-12 A**.
       * **Vt** (param): Thermal voltage of the diodes, default is **0.025 V**.

    Methods:

        sub(): Initializes the four diodes and sets their parameters.
        analog(): Defines the rectification behavior of the circuit.

.. code-block:: python

    from pyams.lib import param, model
    from pyams.models import Diode

    class DiodeBridge(model):
        """
        Diode Bridge model for full-wave rectification.
        """

        def __init__(self, a, b, c, d):
            self.Iss = param(1.0e-12, 'A', 'Saturation current')
            self.Vt = param(0.025, 'V', 'Thermal voltage')
            self.D1 = Diode(a, b)
            self.D2 = Diode(c, b)
            self.D3 = Diode(d, c)
            self.D4 = Diode(d, a)

        def sub(self):
            self.D1.Iss += self.Iss
            self.D2.Iss += self.Iss
            self.D3.Iss += self.Iss
            self.D4.Iss += self.Iss
            self.D1.Vt += self.Vt
            self.D2.Vt += self.Vt
            self.D3.Vt += self.Vt
            self.D4.Vt += self.Vt
            return [self.D1, self.D2, self.D3, self.D4]

        def analog(self):
            pass

:red:`Command syntax`

The **syntax** for defining a Diode Bridge in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import DiodeBridge

    # Bridge1: is the name of the Diode Bridge instance
    # a, b, c, d: Connection points in the circuit
    Bridge1 = DiodeBridge(a, b, c, d)

