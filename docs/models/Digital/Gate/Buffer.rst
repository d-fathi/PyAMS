.. include:: ../importCSS.txt

Buffer Gate
============

:red:`Information`

.. figure:: Buffer.png
   :scale: 50%
   :align: center

A **digital buffer** is a logic gate that outputs the **same logic level** as its input. It is used to **strengthen** the signal and improve **fan-out** without altering the logic. Buffers are useful for **signal isolation**, **delaying**, or **amplifying digital signals** in a circuit.

The truth table for a buffer gate is:

.. list-table::
   :header-rows: 1
   :widths: 20 20

   * - In
     - Out
   * - 0
     - 0
   * - 1
     - 1

:red:`Ports`

- **In**: Digital input  
- **Out**: Digital output (same as input)

:red:`Model`

The **Buffer model** implements a 1-input digital buffer.

    A digital buffer outputs the same logic value as the input, with no inversion.

    Attributes:

       *  In (dsignal): Input digital signal  
       *  Out (dsignal): Output digital signal  

    Methods:

        digital(): Performs the logic buffering operation:

.. math::

    \text{Out} = \text{In}

.. code-block:: python

    from pyams.lib import dsignal, model, circuit

    class BUFFER(model):
        """ Digital buffer model """
        def __init__(self, In, Out):
            # Digital Signal declarations
            self.In = dsignal(direction='in', port=In)
            self.Out = dsignal(direction='out', port=Out)

        def digital(self):
            """ Perform buffer operation """
            self.Out += self.In

:red:`Command syntax`

The **syntax** for defining a buffer gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import BUFFER

    # BUFname: name of the buffer instance
    # In, Out: digital signal ports
    BUFname = BUFFER(In, Out)
