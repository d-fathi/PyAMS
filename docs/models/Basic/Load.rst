
.. include:: ../importCSS.txt

Load
====

:red:`Symbol`

.. figure:: Load.svg

:red:`Information`
 
A **Load** represents a **resistive component** in an electrical circuit. It follows **Ohm’s Law**, which defines the relationship between voltage, current, and resistance:

.. math::  

    V = R \cdot I

Additionally, the **power dissipation** in the load is calculated as:

.. math::  

    P = V \cdot I

Where:

- $V$ is the voltage across the load (Volts)  
- $I$ is the current flowing through the load (Amperes)  
- $R$ is the resistance of the load (Ohms, Ω)  
- $P$ is the power dissipation (Watts, W)  

:red:`Ports`
 
- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`
 
The **Load model** represents a resistive load that follows Ohm’s Law and computes power dissipation.

    This model simulates a resistive load by defining the voltage-current relationship 
    and calculating power dissipation.

    Attributes:

       *  V (signal): Output voltage signal across the load, defined between nodes (p, n).  
       *  I (signal): Input current signal through the load, defined between nodes (p, n).  
       *  R (param): Resistance value in Ohms (Ω), default is **100Ω**.  
       *  P (param): Power dissipation in Watts (W), calculated as **P = V * I**.  

    Methods:

        analog(): Defines the voltage-current relationship using Ohm's Law and calculates power.

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current

    class Load(model):
        """
        Load model based on Ohm’s Law: V = R * I
        """

        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('out', voltage, p, n)
            self.I = signal('in', current, p, n)

            # Parameter declaration
            self.R = param(100, 'Ω', 'Resistive')
            self.P = param(unit='W', description='Power')

        def analog(self):
            """Defines the load’s voltage-current relationship and power dissipation"""
            self.V += self.R * self.I  # Ohm’s Law
            self.P += self.V * self.I  # Power Calculation

:red:`Command syntax`

The **syntax** for defining a load in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Load

    # Lname: is the name of the load instance
    # p, n: The connection points in the circuit
    Lname = Load(p, n)
