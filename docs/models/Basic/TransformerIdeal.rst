.. include:: ../importCSS.txt

Ideal Transformer
=================

:red:`Symbol`

.. figure:: TransformerIdeal.svg

:red:`Information`

.. figure:: TransformerIdeal.png
   :scale: 50%
   :align: center

An **ideal transformer** is a theoretical electrical device that transfers electrical energy between two circuits without any losses. It follows the **voltage and current transformation equations**:

.. math::

    V_s = \frac{V_p}{N}

    I_p = \frac{I_s}{N}

Where:

- $V_p$, $V_s$: Primary and secondary voltage (Volts)  
- $I_p$, $I_s$: Primary and secondary current (Amperes)  
- $N$: Turns ratio (dimensionless)  

An ideal transformer assumes **100% efficiency**, meaning there are no **power losses**, no **leakage inductance**, and no **resistance** in the windings.

:red:`Ports`
 
- **p1, n1**: Primary coil terminals  
- **p2, n2**: Secondary coil terminals

:red:`Symbol description`

.. csv-table::
   :header: Field; Value
   :widths: 10, 10
   :delim: ;

   Symbol.name; Transformer Ideal
   Symbol.file; TransformerIdeal.sym
   Symbol.directory; Basic
   Symbol.referance; ``T``
   Model.name; ``TransformerIdeal``
   Model.file; TransformerIdeal.py

:red:`Model`
 
The **Ideal Transformer model** implements a lossless transformer with a **fixed turns ratio (N)**.

    The voltage and current relationships are defined based on the transformation 
    ratio, ensuring ideal energy transfer.

    Attributes:

       *  Vp (signal): Primary voltage input, defined between nodes (p1, n1).  
       *  Ip (signal): Primary current output, defined between nodes (p1, n1).  
       *  Vs (signal): Secondary voltage output, defined between nodes (p2, n2).  
       *  Is (signal): Secondary current input, defined between nodes (p2, n2).  
       *  N (param): Turns ratio (dimensionless), default is **7.0**.  

    Methods:

        analog(): Defines the ideal transformer relationship:

.. math::  

    V_s = \frac{V_p}{N}

    I_p = \frac{I_s}{N}

.. code-block:: python

    from pyams.lib import model, signal, param
    from pyams.lib import voltage, current

    class TransformerIdeal(model):
        """
        Ideal Transformer Model
        Defines the transformation ratio for voltage and current:
        Vs = Vp / N
        Ip = Is / N
        """

        def __init__(self, p1, n1, p2, n2):
            # Signal declaration
            self.Vp = signal('in', voltage, p1, n1)
            self.Ip = signal('out', current, p1, n1)
            self.Vs = signal('out', voltage, p2, n2)
            self.Is = signal('in', current, p2, n2)

            # Parameter declaration
            self.N = param(7.0, '', 'Winding ratio')

        def analog(self):
            """Defines the voltage and current relationships of an ideal transformer."""
            self.Vs += self.Vp / self.N  # Voltage transformation equation
            self.Ip += self.Is / self.N  # Current transformation equation

:red:`Command syntax`

The **syntax** for defining an Ideal Transformer in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import TransformerIdeal

    # Tname: is the name of the Transformer instance
    # p1, n1: Primary winding connections
    # p2, n2: Secondary winding connections
    Tname = TransformerIdeal(p1, n1, p2, n2)
