.. include:: ../importCSS.txt

XOR Gate
=========

:red:`Information`

.. figure:: XOR.png
   :scale: 70%
   :align: center

A **digital XOR (exclusive OR) gate** outputs a logic high (**1**) only if the number of high inputs is **odd**. For a 2-input gate, this means the output is high if **only one** input is high. It performs a **logical exclusive disjunction**.

The truth table for a 2-input XOR gate is:

.. list-table::
   :header-rows: 1
   :widths: 20 20 20

   * - In1
     - In2
     - Out
   * - 0
     - 0
     - 0
   * - 0
     - 1
     - 1
   * - 1
     - 0
     - 1
   * - 1
     - 1
     - 0

:red:`Ports`

- **In1**: First digital input  
- **In2**: Second digital input  
- **Out**: Digital output (result of In1 XOR In2)

:red:`Model`

The **XOR model** implements a standard 2-input digital XOR logic gate.

    A digital XOR gate outputs logic 1 only when the inputs are different.

    Attributes:

       *  In1 (dsignal): First input digital signal  
       *  In2 (dsignal): Second input digital signal  
       *  Out (dsignal): Output digital signal  

    Methods:

        digital(): Performs the logical XOR operation between input signals:

.. math::

    \text{Out} = \text{In1} \oplus \text{In2}

.. code-block:: python

    from pyams.lib import dsignal, model, circuit

    class XOR(model):
        """ Digital XOR gate model """
        def __init__(self, In1, In2, Out):
            # Digital Signal declarations
            self.In1 = dsignal(direction='in', port=In1)
            self.In2 = dsignal(direction='in', port=In2)
            self.Out = dsignal(direction='out', port=Out)

        def digital(self):
            """ Perform XOR operation """
            self.Out += self.In1 ^ self.In2

:red:`Command syntax`

The **syntax** for defining an XOR gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import XOR

    # XORname: name of the XOR gate instance
    # In1, In2, Out: digital signal ports
    XORname = XOR(In1, In2, Out)
