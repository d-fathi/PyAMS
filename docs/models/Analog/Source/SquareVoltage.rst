.. include:: ../importCSS.txt

Square Voltage
==============

:red:`Symbol`

.. figure:: SquareVoltage.svg

:red:`Information`

.. figure:: SquareVoltage.png
   :scale: 50%
   :align: center

A **Square Wave Voltage Source** generates a **periodic alternating voltage signal** based on the following equation:

.. math::  

    V(t) =
    \begin{cases} 
    V_a + V_{off}, & 0 \leq t < T/2 \\
    V_{off}, & T/2 \leq t < T
    \end{cases}

.. figure:: SquareV.png
   :scale: 50%
   :align: center

Where:

- $V(t)$ is the output voltage at time $t$  
- $V_a$ is the amplitude of the square wave voltage (Volts)  
- $V_{off}$ is the offset voltage (Volts)  
- $T$ is the period of the waveform (Seconds)  

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`
  
The **SquareVoltage model** generates a **square wave voltage signal**.

    This model is useful for **clock signals, switching circuits, and modulation applications**.

    Attributes:

       *  V (signal): Output voltage across terminals (p, n).  
       *  Va (param): Amplitude of the square wave voltage, default is **1 V**.  
       *  T (param): Period of the waveform, default is **0.1 sec**.  
       *  Voff (param): Offset voltage, default is **0 V**.  

    Methods:

        analog(): Implements the square wave voltage output equation.

.. math::  

    V =
    \begin{cases} 
    V_a + V_{off}, & \text{when wave is HIGH} \\
    V_{off}, & \text{when wave is LOW}
    \end{cases}

.. code-block:: python

    from pyams.lib import model, signal, param, time
    from pyams.lib import voltage

    class SquareVoltage(model):
        """
        Square Wave Voltage Source Model.
        """

        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('out', voltage, p, n)

            # Parameter declarations
            self.Va = param(1.0, 'V', 'Amplitude of square wave voltage')
            self.T = param(0.1, 'Sec', 'Period')
            self.Voff = param(0.0, 'V', 'Offset voltage')

        def analog(self):
            """Defines the square wave voltage equation."""
            t = time.value  # Get the current simulation time
            cycle_time = t % self.T  # Time within the current period

            if cycle_time < (self.T / 2):
                self.V += self.Va + self.Voff  # High state
            else:
                self.V += self.Voff  # Low state

:red:`Command syntax`

The **syntax** for defining a square wave voltage source in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import SquareVoltage

    # Vname: is the name of the voltage source instance
    # p, n: The connection points in the circuit
    Vname = SquareVoltage(p, n)
