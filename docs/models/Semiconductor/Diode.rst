

.. include:: ../importCSS.txt

Diode
=====

:red:`Symbol`

.. figure:: Diode.svg

:red:`Information`

.. figure:: Diode.png
   :scale: 50%
   :align: center
  
A **diode** is a semiconductor device that **allows current to flow in one direction** while blocking it in the reverse direction. It follows the **Shockley diode equation**, which defines its current-voltage relationship:

.. math::  

    I = I_{ss} \cdot \left( e^{\frac{V}{n V_t}} - 1 \right)

Where:

- $I$ is the current through the diode (Amperes)  
- $V$ is the voltage across the diode (Volts)  
- $I_{ss}$ is the **saturation current**, representing the small leakage current in reverse bias  
- $V_t$ is the **thermal voltage**, which depends on temperature  
- $n$ is the **ideality factor**, representing how closely the diode follows the ideal diode equation  

Diodes are used in **rectification, signal demodulation, voltage regulation, and circuit protection**.

:red:`Ports`

- **p**: Anode (positive terminal)  
- **n**: Cathode (negative terminal)  

:red:`Model`

The **Diode model** implements a simple nonlinear diode.

    A diode allows current to flow when forward biased and blocks it when reverse biased, following the Shockley equation.

    Attributes:

       *  V (signal): Input voltage signal across the diode, defined between nodes (p, n).  
       *  I (signal): Output current signal through the diode, defined between nodes (p, n).  
       *  Iss (param): Saturation current (default: **1.0e-15 A**).  
       *  Vt (param): Thermal voltage (default: **0.025 V**).  
       *  n (param): Ideality factor (default: **1**).  

    Methods:

        analog(): Defines the diode behavior using the Shockley equation:

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current, explim

    class Diode(model):
        """
        Simple diode model following the Shockley equation.
        """
        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declaration
            self.Iss = param(1.0e-15, 'A', 'Saturation current')
            self.Vt = param(0.025, 'V', 'Thermal voltage')
            self.n = param(1, ' ', 'The ideality factor')

        def analog(self):
            """Defines the diode’s current-voltage relationship"""
            self.I += self.Iss * (explim(self.V / (self.n * self.Vt)) - 1)

:red:`Command syntax`

The **syntax** for defining a diode in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Diode

    # Dname: is the name of the diode instance
    # p, n: The connection points in the circuit
    Dname = Diode(p, n)


