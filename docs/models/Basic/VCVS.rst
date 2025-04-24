.. include:: ../importCSS.txt

Voltage-Controlled Voltage Source (VCVS)
=========================================

:red:`Symbol`

.. figure:: VCVS.svg

:red:`Information`

.. figure:: VCVS.png
   :scale: 50%
   :align: center


A **Voltage-Controlled Voltage Source (VCVS)** is a dependent voltage source whose output voltage is proportional to a reference (control) voltage applied across a separate circuit branch. The fundamental equation governing VCVS is:

.. math::  

    V_{out} = G_v \cdot V_{control}

Where:

- $V_{out}$ is the output voltage (Volts)  
- $V_{control}$ is the controlling input voltage (Volts)  
- $G_v$ is the voltage gain (dimensionless)  

VCVS is commonly used in **operational amplifiers, active filters, and circuit modeling**.

:red:`Ports`

- **cp, cn**: Control voltage terminals  
- **p, n**: Output voltage terminals  

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; VCVS
   Symbol.file; VCVS.sym
   Symbol.directory; Basic
   Symbol.referance; ``C``
   Model.name; ``VCVS``
   Model.file; VCVS.py

:red:`Model`

The **VCVS model** implements an ideal voltage-controlled voltage source.

    A VCVS provides an output voltage proportional to the control voltage.

    Attributes:

       *  V_control (signal): Input voltage signal that controls the output voltage, defined between nodes (cp, cn).  
       *  V_out (signal): Output voltage signal delivered to the circuit, defined between nodes (p, n).  
       *  Gv (param): Voltage gain (dimensionless), default is **1.0**.  

    Methods:

        analog(): Defines the VCVS behavior using the equation:

.. math::  

    V_{out} = G_v \cdot V_{control}

.. code-block:: python

    from pyams.lib import model, signal, param, voltage

    class VCVS(model):
        """
        Voltage-Controlled Voltage Source (VCVS) model.
        Implements the equation: V_out = Gv * V_control
        """

        def __init__(self, cp, cn, p, n):
            # Signal declaration
            self.V_control = signal('in', voltage, cp, cn)
            self.V_out = signal('out', voltage, p, n)

            # Parameter declaration
            self.Gv = param(1.0, '', 'Voltage gain')

        def analog(self):
            """Defines the VCVS behavior"""
            self.V_out += self.Gv * self.V_control

:red:`Command syntax`
 
The **syntax** for defining a VCVS in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import VCVS

    # VCVSname: is the name of the VCVS instance
    # cp, cn: The control voltage terminals
    # p, n: The output voltage terminals
    VCVSname = VCVS(cp, cn, p, n)
