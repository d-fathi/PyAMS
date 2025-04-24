.. include:: ../importCSS.txt

Current-Controlled Current Source (CCCS)
=========================================

:red:`Symbol`

.. figure:: CCCS.svg

:red:`Information`

.. figure:: CCCS.png
   :scale: 50%
   :align: center
 
A **Current-Controlled Current Source (CCCS)** is a dependent current source whose output current is proportional to a reference (control) current flowing through a separate circuit branch. The fundamental equation governing CCCS is:

.. math::  

    I_{out} = k \cdot I_{control}

Where:

- $I_{out}$ is the output current (Amperes)  
- $I_{control}$ is the controlling input current (Amperes)  
- $k$ is the current gain (unitless)  

CCCS is commonly used in **amplifiers, active filters, and analog signal processing**.

:red:`Ports`

- **cp, cn**: Control current terminals  
- **p, n**: Output current terminals

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; CCCS
   Symbol.file; CCCS.sym
   Symbol.directory; Basic
   Symbol.referance; ``C``
   Model.name; ``CCCS``
   Model.file; CCCS.py


:red:`Model`

The **CCCS model** implements an ideal current-controlled current source.

    A CCCS provides an output current proportional to the control current.

    Attributes:

       *  I_control (signal): Input current signal that controls the output current, defined between nodes (cp, cn).  
       *  I_out (signal): Output current signal delivered to the circuit, defined between nodes (p, n).  
       *  k (param): Current gain (dimensionless), default is **1.0**.  

    Methods:

        analog(): Defines the CCCS behavior using the equation:

.. math::  

    I_{out} = k \cdot I_{control}

.. code-block:: python

    from pyams.lib import model, signal, param, current

    class CCCS(model):
        """
        Current-Controlled Current Source (CCCS) model.
        Implements the equation: I_out = k * I_control
        """

        def __init__(self, cp, cn, p, n):
            # Signal declaration
            self.I_control = signal('in', current, cp, cn)
            self.I_out = signal('out', current, p, n)

            # Parameter declaration
            self.k = param(1.0, '', 'Current gain')

        def analog(self):
            """Defines the CCCS behavior"""
            self.I_out += self.k * self.I_control

:red:`Command syntax`
 
The **syntax** for defining a CCCS in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CCCS

    # CCCSname: is the name of the CCCS instance
    # cp, cn: The control current terminals
    # p, n: The output current terminals
    CCCSname = CCCS(cp, cn, p, n)
