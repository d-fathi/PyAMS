.. include:: ../importCSS.txt

DCCurrent
=========

:red:`Information`

A **DC current source** provides a **constant current**, regardless of voltage or circuit conditions. The output current remains fixed at a specified value:

.. math::  

    I = I_{dc}

Where:

- $I$ is the output current (Amperes)  
- $I_{dc}$ is the constant DC current value (default: **1mA**)  

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **DCCurrent model** represents a **constant current source**.

    This model provides a **fixed DC current**, independent of the voltage 
    or other circuit elements.

    Attributes:

       *  I (signal): Output current through terminals (p, n).  
       *  Idc (param): Constant current value, default is **1mA**.  

    Methods:

        analog(): Defines the constant current output equation:

.. math::  

    I = I_{dc}

.. code-block:: python

    from pyams.lib import model, signal, param, current

    class DCCurrent(model):
        """
        DC current source model providing a constant current.
        """

        def __init__(self, p, n):
            # Signal declaration
            self.I = signal('out', current, p, n)

            # Parameter declaration
            self.Idc = param(0.001, 'A', 'Value of constant current')

        def analog(self):
            """Defines the constant current output equation."""
            self.I += self.Idc  # I = Idc

:red:`Command syntax`

The **syntax** for defining a DC current source in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import DCCurrent

    # Iname: is the name of the current source instance
    # p, n: The connection points in the circuit
    Iname = DCCurrent(p, n)
