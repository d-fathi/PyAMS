.. include:: ../importCSS.txt

Puls Current
============

:red:`Symbol`

.. figure:: PulsCurrent.svg

:red:`Information`

.. figure:: PulsCurrent.png
   :scale: 50%
   :align: center

A **Pulsed Current Source** generates a **square wave current signal** based on the following equation:

.. math::  

    I(t) =
    \begin{cases} 
    I_a + I_{off}, & 0 \leq t < D \cdot T \\
    I_{off}, & D \cdot T \leq t < T
    \end{cases}

.. figure:: PulsI.png
   :scale: 50%
   :align: center

Where:

- $I(t)$ is the output current at time $t$  
- $I_a$ is the amplitude of the pulse current (Amperes)  
- $I_{off}$ is the offset current (Amperes)  
- $T$ is the period of the waveform (Seconds)  
- $D$ is the duty cycle (Percentage, %)  

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **PulsCurrent model** generates a **square wave current signal**.

    This model is useful for **modulated current sources, digital circuits, and switching power applications**.

    Attributes:

       *  I (signal): Output current through terminals (p, n).  
       *  Ia (param): Amplitude of the pulse current, default is **1 A**.  
       *  T (param): Period of the waveform, default is **0.1 sec**.  
       *  D (param): Duty cycle percentage, default is **50%**.  
       *  Ioff (param): Offset current, default is **0 A**.  

    Methods:

        analog(): Implements the square wave current output equation.

.. math::  

    I =
    \begin{cases} 
    I_a + I_{off}, & \text{when pulse is ON} \\
    I_{off}, & \text{when pulse is OFF}
    \end{cases}

.. code-block:: python

    from pyams.lib import model, signal, param, time
    from pyams.lib import current

    class PulsCurrent(model):
        """
        Pulsed Current Source Model.
        """

        def __init__(self, p, n):
            # Signal declaration
            self.I = signal('out', current, p, n)

            # Parameter declarations
            self.Ia = param(1.0, 'A', 'Amplitude of square wave current')
            self.T = param(0.1, 'Sec', 'Period')
            self.D = param(50, '%', 'Duty cycle')
            self.Ioff = param(0.0, 'A', 'Offset current')

        def analog(self):
            """Defines the square wave pulse current equation."""
            t = time.value  # Get the current simulation time
            cycle_time = t % self.T  # Time within the current period

            if cycle_time <= (self.D / 100.0) * self.T:
                self.I += self.Ia + self.Ioff  # Pulse ON
            else:
                self.I += self.Ioff  # Pulse OFF

:red:`Command syntax`

The **syntax** for defining a pulsed current source in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import PulsCurrent

    # Iname: is the name of the current source instance
    # p, n: The connection points in the circuit
    Iname = PulsCurrent(p, n)
