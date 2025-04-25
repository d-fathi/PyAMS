

.. include:: ../importCSS.txt

.. _nmos:

NMOS Transistor
===============

:red:`Symbol`

.. figure:: NMOS.svg

:red:`Information`

.. figure:: NMOSFET.png
   :scale: 25%
   :align: center

A **N-channel MOSFET (NMOS)** is a three-terminal semiconductor device used for switching and amplification. The current flow between the drain and source is controlled by the gate-to-source voltage.

The MOSFET operates in three regions:

- **Cutoff Region:** No conduction occurs when $V_{GS} \leq V_T$.
- **Triode Region:** The MOSFET behaves like a resistor when $V_{GS} - V_T \geq V_{DS}$.
- **Saturation Region:** The MOSFET acts as a current source when $V_{GS} - V_T < V_{DS}$.

:red:`Ports`

- **d**: Drain terminal  
- **g**: Gate terminal  
- **s**: Source terminal  

:red:`Model`

The **NMOS model** follows the standard MOSFET equations to describe its behavior.

    Attributes:

       * Vgs (signal): Gate-Source voltage.  
       * Vds (signal): Drain-Source voltage.  
       * Id (signal): Drain current.  
       * Ig (signal): Gate current (idealized to zero).  
       * Kp (param): Transconductance coefficient (default: **200 µA/V²**).  
       * W (param): Channel width (default: **100 µm**).  
       * L (param): Channel length (default: **100 µm**).  
       * Vt (param): Threshold voltage (default: **0.5 V**).  
       * λ (param): Channel-length modulation (default: **0**).  

    Methods:

        analog(): Defines the NMOS behavior in cutoff, triode, and saturation regions.

.. math::  

    I_D = 0, \quad \text{if } V_{GS} \leq V_T  \quad (\text{Cutoff})

.. math::  

    I_D = \frac{K}{2} (V_{GS} - V_T)^2 (1 + \lambda V_{DS}), \quad \text{if } (V_{GS} - V_T) < V_{DS}  \quad (\text{Saturation})

.. math::  

    I_D = K ((V_{GS} - V_T) - \frac{V_{DS}}{2}) (1 + \lambda V_{DS}) V_{DS}, \quad \text{if } (V_{GS} - V_T) \geq V_{DS}  \quad (\text{Triode})

.. code-block:: python

    from pyams.lib import model, signal, param, voltage, current

    class NMOS(model):
        """
        NMOS model with cutoff, triode, and saturation behavior.
        """

        def __init__(self, d, g, s):
            # Signal declaration
            self.Vgs = signal('in', voltage, g, s)
            self.Vds = signal('in', voltage, d, s)
            self.Id = signal('out', current, d, s)
            self.Ig = signal('out', current, g, '0')

            # Parameter declaration
            self.Kp = param(200e-6, 'A/V^2', 'Transconductance coefficient')
            self.W = param(100.0e-6, 'm', 'Channel width')
            self.L = param(100.0e-6, 'm', 'Channel length')
            self.Vt = param(0.5, 'V', 'Threshold voltage')
            self.lambd = param(0.000, '1/V', 'Channel-length modulation')

        def analog(self):
            """Defines the MOSFET's behavior in different operating regions."""
            K = self.Kp * self.W / self.L
            self.Ig += 0.0

            # Cutoff Region: Vgs <= Vt
            if self.Vgs <= self.Vt:
                self.Id += 0.0
            # Saturation Region:  Vgs - Vt < Vds
            elif (self.Vgs - self.Vt) < self.Vds:
                self.Id += K * (self.Vgs - self.Vt) ** 2 * (1 + (self.lambd * self.Vds)) / 2
            # Triode Region:  Vgs - Vt >= Vds
            else:
                self.Id += K * ((self.Vgs - self.Vt) - (self.Vds / 2)) * (1 + (self.lambd * self.Vds)) * self.Vds

:red:`Command syntax`

The **syntax** for defining an NMOS in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import NMOS

    # Mname: is the name of the NMOS instance
    # d, g, s: The connection points in the circuit
    Mname = NMOS(d, g, s)


