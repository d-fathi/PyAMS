.. include:: ../importCSS.txt

Square Current
==============

:red:`Symbol`

.. figure:: SquareCurrent.svg

:red:`Information`

.. figure:: SquareCurrent.png
   :scale: 50%
   :align: center


A **Square Wave Current Source** generates a periodic **square wave** signal that alternates between **high and low states**.

.. math::  
    I(t) =
    \begin{cases} 
    I_a + I_{off}, & 0 \leq t < \frac{T}{2} \\
    I_{off}, & \frac{T}{2} \leq t < T
    \end{cases}

.. figure:: SquareI.png
   :scale: 50%
   :align: center

Where:

- $I_a$: Amplitude of the square wave current  
- $I_{off}$: Offset current  
- $T$: Period of the waveform  

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **SquareCurrent model** generates a **square wave current signal**, useful for **clock signals, digital circuits, and PWM-based control applications**.

    Attributes:

       *  I (signal): Output current between terminals (p, n).  
       *  Ia (param): Amplitude of square wave current, default is **1 A**.  
       *  T (param): Period of the waveform, default is **0.1 sec**.  
       *  Ioff (param): Offset current, default is **0 A**.  

    Methods:

        analog(): Implements the square wave current equation.

.. code-block:: python

   from pyams.lib import model, signal, param, time
   from pyams.lib import current

   # Square Current Source Model--------------------------------------------------
   class SquareCurrent(model):
    """
    This class models a Square Wave Current Source.
    """

    def __init__(self, p, n):
        # Signal declaration
        self.I = signal('out', current, p, n)

        # Parameter declarations
        self.Ia = param(1.0, 'A', 'Amplitude of square wave current')
        self.T = param(0.1, 'Sec', 'Period')
        self.Ioff = param(0.0, 'A', 'Offset current')

    def analog(self):
        """Defines the square wave current equation."""
        t = time  # Get the current simulation time
        cycle_time = t % self.T  # Time within the current period

        if cycle_time < (self.T / 2):
            self.I += self.Ia + self.Ioff  # High state
        else:
            self.I += self.Ioff  # Low state




:red:`Command syntax`

The **syntax** for defining a square current source in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import SquareCurrent

    # Iname: is the name of the current source instance
    # p, n: The connection points in the circuit
    Iname = SquareCurrent(p, n)