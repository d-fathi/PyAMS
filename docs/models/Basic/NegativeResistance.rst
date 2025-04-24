.. include:: ../importCSS.txt

Negative Resistance
===================

:red:`Symbol`

.. figure:: NegativeResistance.svg

:red:`Information`

.. figure:: NegativeResistance.png
   :scale: 50%
   :align: center
 
A **negative resistance** component exhibits an **inverse voltage-current relationship** compared to conventional resistors. Instead of an **increase in voltage** causing an **increase in current**, a negative resistor **decreases current** as voltage increases in certain operating ranges.

The model follows a **piecewise-defined conductance function**, where the behavior changes based on a **threshold voltage (Ve)**.

The mathematical formulation is:

.. math::

    I =
    \begin{cases}
    G_b \cdot (V + V_e) - G_a \cdot V_e, & \text{if } V < -V_e \\
    G_b \cdot (V - V_e) + G_a \cdot V_e, & \text{if } V > V_e \\
    G_a \cdot V, & \text{otherwise}
    \end{cases}

Where:

- $I$ is the current through the negative resistance (A)  
- $V$ is the voltage across the component (V)  
- $G_b$, $G_a$ are conductance multipliers (1/Ω)  
- $V_e$ is the threshold voltage (V)  

:red:`Ports`

- **p**: Positive terminal  
- **n**: Negative terminal  

:red:`Model`

The **Negative Resistance model** represents a nonlinear **voltage-dependent conductance**.

    The current-voltage relationship depends on a threshold voltage (Ve), beyond which 
    different conductance multipliers (Ga, Gb) define the current response.

    Attributes:

       *  V (signal): Input voltage signal, defined between nodes (p, n).  
       *  I (signal): Output current signal, defined between nodes (p, n).  
       *  Gb (param): Conductance multiplier in 1/Ω, default is **-1.0**.  
       *  Ga (param): Conductance multiplier in 1/Ω, default is **-1.0**.  
       *  Ve (param): Threshold voltage (V), default is **1.0V**.  

    Methods:

        analog(): Implements the piecewise function governing the current behavior.

.. code-block:: python

    from pyams.lib import model, signal, param
    from pyams.lib import voltage, current

    class NegativeResistance(model):
        """
        Negative Resistance Model
        Implements a voltage-dependent conductance with nonlinear behavior.
        """

        def __init__(self, p, n):
            # Signal declarations
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declarations
            self.Gb = param(-1.0, '1/Ω', 'Conductance multiplier')
            self.Ga = param(-1.0, '1/Ω', 'Conductance multiplier')
            self.Ve = param(1.0, 'V', 'Voltage')

        def analog(self):
            """Defines the current-voltage relationship for negative resistance."""
            if self.V < -self.Ve:
                self.I += self.Gb * (self.V + self.Ve) - self.Ga * self.Ve
            elif self.V > self.Ve:
                self.I += self.Gb * (self.V - self.Ve) + self.Ga * self.Ve
            else:
                self.I += self.Ga * self.V

:red:`Command syntax`
  
The **syntax** for defining a Negative Resistance model in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import NegativeResistance

    # Rneg: is the name of the Negative Resistance instance
    # p, n: The connection points in the circuit
    Rneg = NegativeResistance(p, n)
