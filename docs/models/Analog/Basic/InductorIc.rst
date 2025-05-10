.. include:: ../importCSS.txt

Inductor with initial current
=============================


:red:`Symbol`

.. figure:: InductorIc.svg
    
:red:`Information`

.. figure:: Inductor.png
   :scale: 50%
   :align: center
 
An **inductor** is a passive electrical component that **stores energy in a magnetic field** and **resists changes in current**.  
This model implements an **inductor with an initial current (Ic)**, meaning it starts with a predefined current when the simulation begins.

The voltage-current relationship of an **ideal inductor** is given by:

.. math::

    V = L \cdot \frac{dI}{dt} 

    I(t=0) = I_c

Where:
- $V$ is the voltage across the inductor
- $I$ is the current through the inductor
- $L$ is the inductance (in Henrys)
- $I_c$ is the initial current

:red:`Ports`
 
- **p, n** → Inductor terminals (voltage across & current through)

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; InductorIc
   Symbol.file; InductorIc.sym
   Symbol.directory; Basic
   Symbol.referance; ``L``
   Model.name; ``InductorIc``
   Model.file; InductorIc.py

:red:`Model`
 
This model represents an **inductor with an initial current**. The voltage across the inductor is **proportional to the rate of change of current**.

    Attributes:

       *  V (signal): Output voltage across the inductor.  
       *  I (signal): Input current through the inductor.  
       *  L (param): Inductance value in Henrys (default: 1.0e-3 H).  
       *  Ic (param): Initial current in Amperes (default: 0 A).  

    Methods:

        analog(): Defines the voltage-current relationship using the differential equation.

.. code-block:: python

    from pyams.lib import signal, model, param
    from pyams.lib import voltage, current
    from pyams.lib import ddt

    class InductorIc(model):
        """
        Inductor model with initial current.
        """

        def __init__(self, p, n):
            # Signal declarations
            self.V = signal('out', voltage, p, n)
            self.I = signal('in', current, p, n)

            # Parameter declarations
            self.L = param(1.0e-3, 'H', 'Inductor value')
            self.Ic = param(0, 'A', 'Initial charge')

        def analog(self):
            """Defines the inductor's voltage-current relationship with initial current."""
            self.V += self.L * ddt(self.I, self.Ic)

:red:`Command syntax`

To use this **InductorIc** model in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import InductorIc

    # Define the inductor
    # L1: instance name
    # p, n: Inductor terminals
    L1 = InductorIc(p, n)
