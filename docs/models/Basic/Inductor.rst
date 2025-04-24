
.. include:: ../importCSS.txt

Inductor
=========

:red:`Symbol`

.. figure:: Inductor.svg
    
:red:`Information`

.. figure:: Inductor.png
   :scale: 50%
   :align: center
 
An **inductor** is a passive electrical component that **stores energy in a magnetic field** when electrical current flows through it. The fundamental equation governing inductors is:

.. math::  

    V = L \cdot \frac{dI}{dt}

Where:

- $V$ is the voltage across the inductor (Volts)  
- $I$ is the current flowing through the inductor (Amperes)  
- $L$ is the inductance (Henries, H)  
- $\frac{dI}{dt}$ is the rate of change of current  

Inductors are used in filtering, energy storage, and oscillatory circuits.

:red:`Ports`
  
- **p**: Positive terminal  
- **n**: Negative terminal

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; Inductor
   Symbol.file; Inductor.sym
   Symbol.directory; Basic
   Symbol.referance; ``L``
   Model.name; ``Inductor``
   Model.file; Inductor.py

:red:`Model`

The **Inductor model** implements an ideal inductor.

    An inductor stores electrical energy in a magnetic field and its voltage 
    is proportional to the rate of change of current through it.

    Attributes:

       *  V (signal): Output voltage signal across the inductor, defined between nodes (p, n).  
       *  I (signal): Input current signal through the inductor, defined between nodes (p, n).  
       *  L (param): Inductance value in Henries (H), default is **1.0 mH**.  

    Methods:

        analog(): Defines the inductor behavior using the equation:

.. math::  

    V = L \cdot \frac{dI}{dt}

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current

    class Inductor(model):
        """
        Inductor model based on the equation: V = L * dI/dt
        """

        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('out', voltage, p, n)
            self.I = signal('in', current, p, n)

            # Parameter declaration
            self.L = param(1e-3, 'H', 'Inductance value')

        def analog(self):
            """Defines the inductor’s current-voltage relationship"""
            self.V += self.L * self.I.dt()

:red:`Command syntax`

The **syntax** for defining an inductor in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Inductor

    # Lname: is the name of the inductor instance
    # p, n: The connection points in the circuit
    Lname = Inductor(p, n)
