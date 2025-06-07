.. include:: ../importCSS.txt

NOR Gate
=========

:red:`Information`

.. figure:: NOR.png
   :scale: 70%
   :align: center

A **digital NOR gate** is a combination of an **OR gate followed by a NOT gate**. It outputs a logic high (**1**) only if **all** of its inputs are low (**0**). It performs the **negation of the logical disjunction**.

The truth table for a 2-input NOR gate is:

.. list-table::
   :header-rows: 1
   :widths: 20 20 20

   * - In1
     - In2
     - Out
   * - 0
     - 0
     - 1
   * - 0
     - 1
     - 0
   * - 1
     - 0
     - 0
   * - 1
     - 1
     - 0

:red:`Ports`

- **In1**: First digital input  
- **In2**: Second digital input  
- **Out**: Digital output (result of NOT(In1 OR In2))

:red:`Model`

The **NOR model** implements a standard 2-input digital NOR logic gate.

    A digital NOR gate outputs logic 1 only when both inputs are logic 0.

    Attributes:

       *  In1 (dsignal): First input digital signal  
       *  In2 (dsignal): Second input digital signal  
       *  Out (dsignal): Output digital signal  

    Methods:

        digital(): Performs the logical NOR operation:

.. math::

    \text{Out} = \lnot (\text{In1} \lor \text{In2})

.. code-block:: python

    from pyams.lib import dsignal, model, circuit

    class NOR(model):
        """ Digital NOR gate model """
        def __init__(self, In1, In2, Out):
            # Digital Signal declarations
            self.In1 = dsignal(direction='in', port=In1)
            self.In2 = dsignal(direction='in', port=In2)
            self.Out = dsignal(direction='out', port=Out)

        def digital(self):
            """ Perform NOR operation """
            self.Out += ~(self.In1 | self.In2)

:red:`Command syntax`

The **syntax** for defining a NOR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import NOR

    # NORname: name of the NOR gate instance
    # In1, In2, Out: digital signal ports
    NORname = NOR(In1, In2, Out)
