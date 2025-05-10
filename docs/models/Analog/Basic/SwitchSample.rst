.. include:: ../importCSS.txt

Switch Sample
============

:red:`Symbol`

.. figure:: SwitchSample.svg

:red:`Information`

.. figure:: SwitchSample.png
   :scale: 50%
   :align: center
  
A **SwitchSample** is a **voltage-controlled switch** that changes its resistance based on a control voltage. It operates with two states:

- **ON state**: When the control voltage exceeds a defined threshold (Von), the switch has a low resistance (Ron).  
- **OFF state**: When the control voltage falls below another threshold (Voff), the switch has a high resistance (Roff).  

This model is useful in circuits that require dynamic switching behavior.

:red:`Ports`

- **c**: Control voltage input  
- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **SwitchSample model** simulates a voltage-controlled switch by varying the resistance dynamically.

    The switch behavior is controlled by the voltage applied at the control terminal (c). It switches between a high and low resistance state based on the threshold voltages.

    Attributes:

       *  Vc (signal): Control voltage that determines the switch state.  
       *  Rs (Resistor): Internal resistor model that simulates switch resistance.  
       *  Von (param): Voltage threshold for turning the switch **ON** (default: **5V**).  
       *  Voff (param): Voltage threshold for turning the switch **OFF** (default: **-5V**).  
       *  Ron (param): Resistance when switch is **ON** (default: **10Ω**).  
       *  Roff (param): Resistance when switch is **OFF** (default: **1MΩ**).  
       *  Rint (param): Initial resistance value (default: **10Ω**).  

    Methods:

        * **sub()**: Initializes the internal resistor model with the default resistance.  
        * **analog()**: Updates resistance dynamically based on the control voltage.

.. math::  

    R = 
    \begin{cases} 
    R_{\text{on}}, & \text{if } V_c \geq V_{\text{on}} \\
    R_{\text{off}}, & \text{if } V_c \leq V_{\text{off}} \\
    R_{\text{int}}, & \text{otherwise}
    \end{cases}

.. code-block:: python

    from pyams.lib import model, signal, param, voltage
    from pyams.models.Basic.Resistor import Resistor

    class SwitchSample(model):
        """
        Voltage-Controlled Switch Model.
        """

        def __init__(self, c, p, n):
            # Signal declaration
            self.Vc = signal('in', voltage, c)

            # Resistor model
            self.Rs = Resistor(p, n)

            # Parameter declaration
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

The **syntax** for defining a switch in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import SwitchSample

    # Sname: is the name of the switch instance
    # c, p, n: The connection points in the circuit
    Sname = SwitchSample(c, p, n)

