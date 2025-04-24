.. include:: ../importCSS.txt

DCVoltage
=========

:red:`Information`

A **DC voltage source** provides a **constant voltage** regardless of the current or circuit conditions. The output voltage remains fixed at a specified value:

.. math::  

    V = V_{dc}

Where:

- $V$ is the output voltage (Volts)  
- $V_{dc}$ is the constant DC voltage value (default: **15V**)  

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **DCVoltage model** represents a **constant voltage source**.

    This model provides a **fixed DC voltage**, independent of current flow 
    or other elements in the circuit.

    Attributes:

       *  V (signal): Output voltage across terminals (p, n).  
       *  Vdc (param): Constant voltage value, default is **15V**.  

    Methods:

        analog(): Defines the constant voltage output equation:

.. math::  

    V = V_{dc}

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class DCVoltage(model):
        """
        DC voltage source model providing a constant voltage.
        """

        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('out', voltage, p, n)

            # Parameter declaration
            self.Vdc = param(15.0, 'V', 'Value of constant voltage')

        def analog(self):
            """Defines the constant voltage output equation."""
            self.V += self.Vdc  # V = Vdc

:red:`Command syntax`

The **syntax** for defining a DC voltage source in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import DCVoltage

    # Vname: is the name of the voltage source instance
    # p, n: The connection points in the circuit
    Vname = DCVoltage(p, n)
