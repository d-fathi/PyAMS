
.. include:: ../importCSS.txt

Capacitor with initial voltage
==============================

:red:`Symbol`

.. figure:: CapacitorIC.svg
    
:red:`Information`

.. figure:: Capacitor.png
   :scale: 50%
   :align: center
 
A **capacitor** is a passive electrical component that **stores electrical energy** in an **electric field**. The current flowing through a capacitor is proportional to the rate of change of voltage across it:

.. math::  

    I = C \cdot \frac{dV}{dt}

This model also accounts for an **initial charge** (Ic), meaning the capacitor can start with a predefined voltage at time **t=0**.

Where:

- $I$ is the current through the capacitor (Amperes)  
- $V$ is the voltage across the capacitor (Volts)  
- $C$ is the capacitance (Farads, F)  
- $t$ is time (seconds)  

:red:`Ports`
 
- **p**: Positive terminal  
- **n**: Negative terminal

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; CapacitorIc
   Symbol.file; CapacitorIc.sym
   Symbol.directory; Basic
   Symbol.referance; ``C``
   Model.name; ``CapacitorIc``
   Model.file; CapacitorIC.py

:red:`Model`

The **CapacitorIc model** simulates a capacitor with an **initial charge**.

    This model represents a capacitor where the current is proportional 
    to the rate of voltage change across it, also considering an initial charge.

    Attributes:

       *  V (signal): Input voltage signal across the capacitor, defined between nodes (p, n).  
       *  I (signal): Output current signal through the capacitor, defined between nodes (p, n).  
       *  C (param): Capacitance value in Farads (F), default is **1.0 µF**.  
       *  Ic (param): Initial charge in Volts (V), default is **0V**.  

    Methods:

        analog(): Defines the capacitor behavior using the differential equation:

.. math::  

    I = C \cdot \frac{dV}{dt}, \quad \text{for } V(0) = I_c

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current, ddt

    class CapacitorIc(model):
        """
        Capacitor model based on I = C * dV/dt with an initial charge.
        """

        def __init__(self, p, n):
            # Signal declarations
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declarations
            self.C = param(1.0e-6, 'F', 'Capacitor value')
            self.Ic = param(0, 'V', 'Initial charge')

        def analog(self):
            """Defines the capacitor’s current-voltage relationship with initial charge"""
            self.I += self.C * ddt(self.V, self.Ic)

:red:`Command syntax`

The **syntax** for defining a capacitor in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CapacitorIc

    # Cname: is the name of the capacitor instance
    # p, n: The connection points in the circuit
    Cname = CapacitorIc(p, n)
