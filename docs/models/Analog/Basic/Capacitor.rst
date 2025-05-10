.. include:: ../importCSS.txt

This is the best way to explain, especially explaining the model (in the form of rst)

Capacitor
=========

:red:`Symbol`

.. figure:: Capacitor.svg
    
:red:`Information`

.. figure:: Capacitor.png
   :scale: 50%
   :align: center

A **capacitor** is a passive electrical component that **stores energy in an electric field**. It consists of two conductive plates separated by an insulating material (**dielectric**). The fundamental equation governing capacitors is:

.. math::

    I = C \cdot \frac{dV}{dt}

Where:

- $I$ is the current flowing through the capacitor (Amperes)
- $C$ is the capacitance (Farads)
- $\frac{dV}{dt}$ is the rate of change of voltage across the capacitor

Capacitors are used for energy storage, filtering, and coupling in electrical circuits.

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; Capacitor
   Symbol.file; Capacitor.sym
   Symbol.directory; Basic
   Symbol.referance; ``C``
   Model.name; ``Capacitor``
   Model.file; Capacitor.py


:red:`Model`

The **Capacitor model** is class implements a Capacitor model.

    A capacitor stores electrical energy in an electric field and its current 
    is proportional to the rate of change of voltage across it.

    Attributes:

       *  V (signal): Input voltage signal across the capacitor, defined between nodes (p, n).
       *  I (signal): Output current signal through the capacitor, defined between nodes (p, n).
       *  C (param): Capacitance value in Farads (F), default is 1.0e-6 F.

    Methods:

        analog(): Defines the capacitor behavior using the equation:

.. math::  

    I = C \cdot \frac{dV}{dt}


.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current

    class Capacitor(model):
        """
        Capacitor model based on the equation: I = C * dV/dt
        """

        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declaration
            self.C = param(1e-6, 'F', 'Capacitance value')

        def analog(self):
            """Defines the capacitor’s current-voltage relationship"""
            self.I += self.C * self.V.dt()

:red:`Command syntax`

The **syntax** for defining a capacitor in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Capacitor

    # Cname: is the name of the capacitor instance
    # p, n: The connection points in the circuit
    Cname = Capacitor(p, n)