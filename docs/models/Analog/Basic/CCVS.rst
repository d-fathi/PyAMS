.. include:: ../importCSS.txt

Current-Controlled Voltage Source (CCVS)
=========================================

:red:`Symbol`

.. figure:: CCVS.svg

:red:`Information`

.. figure:: CCVS.png
   :scale: 50%
   :align: center
 
A **Current-Controlled Voltage Source (CCVS)** is a dependent voltage source whose output voltage is proportional to a reference (control) current flowing through a separate circuit branch. The fundamental equation governing CCVS is:

.. math::  

    V_{out} = R_m \cdot I_{control}

Where:

- $V_{out}$ is the output voltage (Volts)  
- $I_{control}$ is the controlling input current (Amperes)  
- $R_m$ is the transresistance gain (Ohms)  

CCVS is commonly used in **transimpedance amplifiers, sensors, and analog signal processing**.

:red:`Ports`

- **cp, cn**: Control current terminals  
- **p, n**: Output voltage terminals  

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; CCVS
   Symbol.file; CCVS.sym
   Symbol.directory; Basic
   Symbol.referance; ``C``
   Model.name; ``CCVS``
   Model.file; CCVS.py

:red:`Model`

The **CCVS model** implements an ideal current-controlled voltage source.

    A CCVS provides an output voltage proportional to the control current.

    Attributes:

       *  I_control (signal): Input current signal that controls the output voltage, defined between nodes (cp, cn).  
       *  V_out (signal): Output voltage signal delivered to the circuit, defined between nodes (p, n).  
       *  Rm (param): Transresistance gain (Ohms), default is **1.0 Ω**.  

    Methods:

        analog(): Defines the CCVS behavior using the equation:

.. math::  

    V_{out} = R_m \cdot I_{control}

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current

    class CCVS(model):
        """
        Current-Controlled Voltage Source (CCVS) model.
        Implements the equation: V_out = Rm * I_control
        """

        def __init__(self, cp, cn, p, n):
            # Signal declaration
            self.I_control = signal('in', current, cp, cn)
            self.V_out = signal('out', voltage, p, n)

            # Parameter declaration
            self.Rm = param(1.0, 'Ω', 'Transresistance gain')

        def analog(self):
            """Defines the CCVS behavior"""
            self.V_out += self.Rm * self.I_control

:red:`Command syntax`

The **syntax** for defining a CCVS in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import CCVS

    # CCVSname: is the name of the CCVS instance
    # cp, cn: The control current terminals
    # p, n: The output voltage terminals
    CCVSname = CCVS(cp, cn, p, n)
