

.. include:: ../importCSS.txt

Voltage-Controlled Switch
=========================

:red:`Symbol`

.. figure:: Switch.svg

:red:`Information`

.. figure:: Switch.png
   :scale: 50%
   :align: center

A **Voltage-Controlled Switch** is an electronic component that changes its resistance **based on a control voltage (Vc)**. The switch consists of an **internal resistor (Rs)** whose resistance dynamically changes between **Ron (low resistance)** and **Roff (high resistance)** depending on the control voltage.

The switching behavior is defined as:

.. math::

    R = R_{on}, \quad \text{if } V_c \geq V_{on}

    R = R_{off}, \quad \text{if } V_c \leq V_{off}

Where:

- $R$ is the resistance of the switch
- $V_c$ is the control voltage
- $V_{on}$ is the voltage threshold to turn **ON** the switch
- $V_{off}$ is the voltage threshold to turn **OFF** the switch
- $R_{on}$ is the resistance when the switch is **ON**
- $R_{off}$ is the resistance when the switch is **OFF**

:red:`Ports`

- **pc, nc**: Control voltage input terminals  
- **p, n**: Switch terminals  

:red:`Model`
 
The **Voltage-Controlled Switch model** simulates a switch using a **variable resistor**.

    The switch operates based on the control voltage (Vc) and uses an 
    internal resistor model (Rs) to represent its resistance.

    Attributes:

       *  Vc (signal): Control voltage input that determines switch state.  
       *  Rs (Resistor): Internal resistor model representing switch resistance.  
       *  Von (param): Voltage threshold to turn the switch ON (default: 5V).  
       *  Voff (param): Voltage threshold to turn the switch OFF (default: -5V).  
       *  Ron (param): Resistance value when the switch is ON (default: 10Ω).  
       *  Roff (param): Resistance value when the switch is OFF (default: 1MΩ).  
       *  Rint (param): Initial resistance value (default: 10Ω).  

    Methods:

        sub(): Initializes the internal resistor model.  
        analog(): Dynamically updates resistance based on control voltage.

.. code-block:: python

    from pyams.lib import model, signal, param
    from pyams.lib import voltage, current
    from pyams.models.Basic.Resistor import Resistor

    class Switch(model):
        """
        Voltage-Controlled Switch Model
        """

        def __init__(self, pc, nc, p, n):
            # Signal declarations
            self.Vc = signal('in', voltage, pc, nc)

            # Resistor model
            self.Rs = Resistor(p, n)

            # Parameter declarations
            self.Von = param(5.0, 'V', 'Voltage for switch ON')
            self.Voff = param(-5.0, 'V', 'Voltage for switch OFF')
            self.Ron = param(10.0, 'Ω', 'ON-state resistance')
            self.Roff = param(1e+6, 'Ω', 'OFF-state resistance')
            self.Rint = param(10.0, 'Ω', 'Initial resistance value')

        def sub(self):
            """Initializes the internal resistor model with default resistance."""
            self.Rs.R = self.Rint
            return [self.Rs]

        def analog(self):
            """Updates the resistance value based on control voltage."""
            if self.Vc >= self.Von:
                self.Rs.R = self.Ron  # Switch ON

            if self.Vc <= self.Voff:
                self.Rs.R = self.Roff  # Switch OFF

:red:`Command syntax`

The **syntax** for defining a Voltage-Controlled Switch model in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Switch

    # Sname: is the name of the switch instance
    # pc, nc: Control voltage input terminals
    # p, n: Switch terminals in the circuit
    Sname = Switch(pc, nc, p, n)
