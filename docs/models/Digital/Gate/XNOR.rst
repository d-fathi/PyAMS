.. include:: ../importCSS.txt

XNOR Gate
==========

:red:`Information`

.. figure:: XNOR.png
   :scale: 70%
   :align: center

A **digital XNOR (exclusive-NOR) gate** is the complement of the XOR gate. It outputs a logic high (**1**) only if its inputs are **equal** — both 0 or both 1. It performs the **logical equivalence** operation.

The truth table for a 2-input XNOR gate is:

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
     - 1

:red:`Ports`

- **In1**: First digital input  
- **In2**: Second digital input  
- **Out**: Digital output (result of NOT(In1 XOR In2))

:red:`Model`

The **XNOR model** implements a standard 2-input digital XNOR logic gate.

    A digital XNOR gate outputs logic 1 only when both inputs are equal.

    Attributes:

       *  In1 (dsignal): First input digital signal  
       *  In2 (dsignal): Second input digital signal  
       *  Out (dsignal): Output digital signal  

    Methods:

        digital(): Performs the logical XNOR operation:

.. math::

    \text{Out} = \lnot (\text{In1} \oplus \text{In2})

.. code-block:: python

    from pyams.lib import dsignal, model, circuit

    class XNOR(model):
        """ Digital XNOR gate model """
        def __init__(self, In1, In2, Out):
            # Digital Signal declarations
            self.In1 = dsignal(direction='in', port=In1)
            self.In2 = dsignal(direction='in', port=In2)
            self.Out = dsignal(direction='out', port=Out)

        def digital(self):
            """ Perform XNOR operation """
            self.Out += ~(self.In1 ^ self.In2)

:red:`Command syntax`

The **syntax** for defining an XNOR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import XNOR

    # XNORname: name of the XNOR gate instance
    # In1, In2, Out: digital signal ports
    XNORname = XNOR(In1, In2, Out)
