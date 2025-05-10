
.. include:: ../importCSS.txt

Nonlinear Resistance
====================

:red:`Symbol`

.. figure:: NonlinearResistance.svg

:red:`Information`

.. figure:: NonlinearResistance.png
   :scale: 50%
   :align: center
 
A **nonlinear resistor** is an electrical component whose **current-voltage (I-V) relationship** deviates from Ohm’s Law. Unlike a standard resistor where **I = V/R**, the current in a nonlinear resistor follows a **nonlinear function of voltage**.

This model is defined by:

.. math::

    I = \mu \cdot V \cdot (V^2 - 1)

Where:

- $I$ is the current through the nonlinear resistor (A)  
- $V$ is the voltage across the nonlinear resistor (V)  
- $\mu$ is a scalar **nonlinearity factor**  

:red:`Ports`
 
- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **Nonlinear Resistance model** represents a voltage-dependent resistance.

    The resistor exhibits a nonlinear behavior, meaning the current response 
    is not directly proportional to the applied voltage.

    Attributes:

       *  V (signal): Input voltage signal, defined between nodes (p, n).  
       *  I (signal): Output current signal, defined between nodes (p, n).  
       *  µ (param): Nonlinearity scalar (dimensionless), default is **1.0**.  

    Methods:

        analog(): Implements the nonlinear current-voltage function.

.. code-block:: python

    from pyams.lib import model, signal, param
    from pyams.lib import voltage, current

    class NonlinearResistance(model):
        """
        Nonlinear Resistance Model
        Defines a resistor with a nonlinear current-voltage relationship.
        """

        def __init__(self, p, n):
            # Signal declarations
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declarations
            self.µ = param(1.0, ' ', 'Scalar of nonlinearity')

        def analog(self):
            """Defines the nonlinear current-voltage relationship."""
            self.I += self.µ * self.V * (self.V * self.V - 1)

:red:`Command syntax`

The **syntax** for defining a Nonlinear Resistance model in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import NonlinearResistance

    # Rnonlin: is the name of the nonlinear resistance instance
    # p, n: The connection points in the circuit
    Rnonlin = NonlinearResistance(p, n)
