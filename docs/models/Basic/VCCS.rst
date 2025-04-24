.. include:: ../importCSS.txt

Voltage-Controlled Current Source (VCCS)
=========================================

:red:`Symbol`

.. figure:: VCCS.svg

:red:`Information`

.. figure:: VCCS.png
   :scale: 50%
   :align: center

 
A **Voltage-Controlled Current Source (VCCS)** is a dependent current source whose output current is proportional to a reference (control) voltage applied across a separate circuit branch. The fundamental equation governing VCCS is:

.. math::  

    I_{out} = G_m \cdot V_{control}

Where:

- $I_{out}$ is the output current (Amperes)  
- $V_{control}$ is the controlling input voltage (Volts)  
- $G_m$ is the transconductance gain (Siemens)  

VCCS is widely used in **analog amplifiers, active filters, and transistor models**.

:red:`Ports`

- **cp, cn**: Control voltage terminals  
- **p, n**: Output current terminals  

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; VCCS
   Symbol.file; VCCS.sym
   Symbol.directory; Basic
   Symbol.referance; ``C``
   Model.name; ``VCCS``
   Model.file; VCCS.py

:red:`Model`

The **VCCS model** implements an ideal voltage-controlled current source.

    A VCCS provides an output current proportional to the control voltage.

    Attributes:

       *  V_control (signal): Input voltage signal that controls the output current, defined between nodes (cp, cn).  
       *  I_out (signal): Output current signal delivered to the circuit, defined between nodes (p, n).  
       *  Gm (param): Transconductance gain (Siemens), default is **1.0 S**.  

    Methods:

        analog(): Defines the VCCS behavior using the equation:

.. math::  

    I_{out} = G_m \cdot V_{control}

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current

    class VCCS(model):
        """
        Voltage-Controlled Current Source (VCCS) model.
        Implements the equation: I_out = Gm * V_control
        """

        def __init__(self, cp, cn, p, n):
            # Signal declaration
            self.V_control = signal('in', voltage, cp, cn)
            self.I_out = signal('out', current, p, n)

            # Parameter declaration
            self.Gm = param(1.0, 'S', 'Transconductance gain')

        def analog(self):
            """Defines the VCCS behavior"""
            self.I_out += self.Gm * self.V_control

:red:`Command syntax`

The **syntax** for defining a VCCS in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import VCCS

    # VCCSname: is the name of the VCCS instance
    # cp, cn: The control voltage terminals
    # p, n: The output current terminals
    VCCSname = VCCS(cp, cn, p, n)
