.. include:: ../importCSS.txt

Clk
===

:red:`Information`

.. figure:: Clk.png
   :scale: 50%
   :align: center

A **clock (clk)** source is a digital signal generator that **produces a periodic square wave** used for synchronizing operations in digital circuits. It toggles between **high ('1') and low ('0')** states at regular time intervals, defined by its period.

:red:`Ports`

- **Out**: Digital output terminal

:red:`Model`

The **Clk model** implements a **digital square wave generator**.

    It outputs a periodic digital signal that alternates between logic high and logic low, based on a specified time period.

    Attributes:

       *  Out (dsignal): Digital output signal that alternates with time.  
       *  T (param): Period of the clock signal in seconds, default is **0.1 s**.

    Methods:

        digital(): Defines the output behavior of the clock using simulation time to generate a square wave.

.. code-block:: python

    from pyams.lib import model, dsignal, param, time, digitalValue

    class Clk(model):
        """
        Digital Clock model: generates a periodic square wave signal.
        """

        def __init__(self, Out):
            # Digital signal declaration
            self.Out = dsignal(direction='out', port=Out, value='1')

            # Parameter declarations
            self.T = param(0.1, 'Sec', 'Period')

        def digital(self):
            """Generates a square wave based on the current simulation time."""
            t = time  # Get current simulation time
            cycle_time = t % self.T  # Time within current period

            if cycle_time < (self.T / 2):
                self.Out += digitalValue('1')  # High state
            else:
                self.Out += digitalValue('0')  # Low state

:red:`Command syntax`

The **syntax** for defining a clk source in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Clk

    # clk_name: is the name of the clock instance
    # Out: the digital output node of the clock
    clk_name = Clk(Out)
