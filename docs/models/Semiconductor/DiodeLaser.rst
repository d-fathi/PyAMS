Diode Laser
===========

:red:`Symbol`

.. figure:: Diode.svg

:red:`Information`

.. figure:: Diode.png
   :scale: 50%
   :align: center
  
A **diode laser** is a semiconductor device that **generates coherent light** based on the interaction between electrical current and the active laser medium. It operates similarly to a conventional diode but incorporates additional effects such as **thermal resistance** and **junction capacitance**, which influence its behavior.

The current-voltage relationship of the diode laser is given by:

.. math::  

    I = I_{ss} \cdot \left( e^{\frac{V}{n V_t}} - 1 \right) + R_{th} V + C_j \frac{dV}{dt}

Where:

- $I$ is the current through the diode laser (Amperes)  
- $V$ is the voltage across the diode laser (Volts)  
- $I_{ss}$ is the **saturation current**, representing the small leakage current in reverse bias  
- $V_t$ is the **thermal voltage**, depending on temperature  
- $n$ is the **ideality factor**, representing how closely the diode follows the ideal diode equation  
- $R_{th}$ is the **thermal resistance**, modeling heat dissipation  
- $C_j$ is the **junction capacitance**, representing charge storage effects  

Diode lasers are widely used in **optical communication, laser printing, barcode scanning, and material processing**.

:red:`Ports`

- **p**: Anode (positive terminal)  
- **n**: Cathode (negative terminal)  

:red:`Model`

The **Diode Laser model** implements an advanced nonlinear diode with thermal and capacitance effects.

    A diode laser generates light and follows a nonlinear current-voltage relationship while considering thermal and charge storage effects.

    Attributes:

       *  V (signal): Input voltage signal across the diode laser, defined between nodes (p, n).  
       *  I (signal): Output current signal through the diode laser, defined between nodes (p, n).  
       *  Iss (param): Saturation current (default: **1.0e-15 A**).  
       *  Vt (param): Thermal voltage (default: **0.025 V**).  
       *  n (param): Ideality factor (default: **1**).  
       *  Rth (param): Thermal resistance (default: **10 Ω**).  
       *  Cj (param): Junction capacitance (default: **1e-9 F**).  

    Methods:

        analog(): Defines the diode laser behavior using the Shockley equation with thermal and capacitance effects:

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current, explim, ddt

    class DiodeLaser(model):
        """
        Diode Laser model incorporating thermal resistance and junction capacitance.
        """
        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declaration
            self.Iss = param(1.0e-15, 'A', 'Saturation current')
            self.Vt = param(0.025, 'V', 'Thermal voltage')
            self.n = param(1, ' ', 'The ideality factor')
            self.Rth = param(10, 'Ω', 'Thermal resistance between anode and cathode')
            self.Cj = param(1e-9, 'F', 'Junction capacitance between anode and cathode')

        def analog(self):
            """Defines the diode laser’s current-voltage relationship"""
            self.I += self.Iss * (explim(self.V / (self.n * self.Vt)) - 1) + self.Rth * self.V + self.Cj * ddt(self.V)

:red:`Command syntax`

The **syntax** for defining a diode laser in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import DiodeLaser

    # DLname: is the name of the diode laser instance
    # p, n: The connection points in the circuit
    DLname = DiodeLaser(p, n)

