

.. include:: ../importCSS.txt

Diode Zener 
===========

:red:`Symbol`

.. figure:: DiodeZener.svg


:red:`Information`

.. figure:: DiodeZener.png
   :scale: 50%
   :align: center

A **Zener diode** is a special type of diode that allows current to flow in the forward direction like a standard diode but also permits current in the reverse direction when the voltage exceeds a certain **breakdown voltage**.

The current-voltage relationship of a Zener diode follows the **Shockley diode equation** in forward bias and allows controlled conduction in reverse bias once breakdown voltage is reached.

:red:`Ports`

- **p**: Anode (positive terminal)
- **n**: Cathode (negative terminal)

:red:`Model`

The **Zener Diode model** represents both forward conduction and reverse breakdown behavior.

    The Zener diode operates as a standard diode in forward bias and allows
    controlled reverse conduction once breakdown voltage is exceeded.

    Attributes:

       *  V (signal): Input voltage signal across the diode, defined between nodes (p, n).
       *  I (signal): Output current signal through the diode, defined between nodes (p, n).
       *  Iss (param): Saturation current (default: **1.0e-12 A**), representing small leakage current.
       *  Vt (param): Thermal voltage (default: **0.025 V**), temperature-dependent.
       *  N (param): Forward emission coefficient (default: **1.0**), affecting diode equation.
       *  BV (param): Breakdown voltage (default: **10.0 V**), defining reverse conduction onset.
       *  IBV (param): Breakdown current (default: **0.001 A**), current at breakdown voltage.

    Methods:

        analog(): Defines the Zener diode behavior using:

.. math::

    I = I_{ss} (e^{V/V_t} - 1) + I_{BV} (e^{-(V + BV) / V_t} - 1) * (-1)

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current, explim

    class DiodeZener(model):
        """
        Zener diode model with forward and reverse breakdown behavior.
        """

        def __init__(self, p, n):
            # Signal declaration
            self.V = signal('in', voltage, p, n)
            self.I = signal('out', current, p, n)

            # Parameter declaration
            self.Iss = param(1.0e-12, 'A', 'Saturation current')
            self.Vt = param(0.025, ' ', 'Thermal voltage')
            self.N = param(1.0, ' ', 'Forward emission coefficient')
            self.BV = param(10.0, 'V', 'Breakdown voltage')
            self.IBV = param(0.001, 'A', 'Breakdown current')

        def analog(self):
            """Defines the Zener diode’s voltage-current relationship."""
            Id = self.Iss * (explim(self.V / self.Vt) - 1)
            Ii = self.IBV * (explim(-(self.V + self.BV) / self.Vt) - 1) * -1
            self.I += Id + Ii

:red:`Command syntax`

The **syntax** for defining a Zener diode in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import DiodeZener

    # Dname: is the name of the Zener diode instance
    # p, n: The connection points in the circuit
    Dname = DiodeZener(p, n)

