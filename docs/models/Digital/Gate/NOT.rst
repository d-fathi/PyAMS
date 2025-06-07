.. include:: ../importCSS.txt

NOT Gate
=========

:red:`Information`

.. figure:: NOT.png
   :scale: 50%
   :align: center

A **digital NOT gate**, also known as an **inverter**, outputs the **opposite logic level** of its input. If the input is logic high (**1**), the output is logic low (**0**), and vice versa. It performs a **logical negation**.

The truth table for a NOT gate is:

.. list-table::
   :header-rows: 1
   :widths: 20 20

   * - In
     - Out
   * - 0
     - 1
   * - 1
     - 0

:red:`Ports`

- **In**: Digital input  
- **Out**: Digital output (logical inverse of input)

:red:`Model`

The **NOT model** implements a standard 1-input digital inverter.

    A digital NOT gate outputs the complement of the input signal.

    Attributes:

       *  In (dsignal): Input digital signal  
       *  Out (dsignal): Output digital signal  

    Methods:

        digital(): Performs the logical NOT operation:

.. math::

    \text{Out} = \lnot \text{In}

.. code-block:: python

    from pyams.lib import dsignal, model, circuit

    class NOT(model):
        """ Digital NOT gate model """
        def __init__(self, In, Out):
            # Digital Signal declarations
            self.In = dsignal(direction='in', port=In)
            self.Out = dsignal(direction='out', port=Out)

        def digital(self):
            """ Perform NOT operation """
            self.Out += ~self.In

:red:`Command syntax`

The **syntax** for defining a NOT gate in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import NOT

    # NOTname: name of the NOT gate instance
    # In, Out: digital signal ports
    NOTname = NOT(In, Out)
