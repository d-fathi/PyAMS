.. include:: ../importCSS.txt

1-bit Digital Comparator
=========================

:red:`Information`

.. figure:: Comparator1bit.png
   :scale: 50%
   :align: center

A **1-bit Digital Comparator** compares two individual binary inputs and determines whether one is greater than, less than, or equal to the other. It is commonly used as a basic building block in multi-bit comparators.

:red:`Ports`

- **A**: First 1-bit input  
- **B**: Second 1-bit input  
- **A_gt_B**: Output is high if A > B  
- **A_lt_B**: Output is high if A < B  
- **A_eq_B**: Output is high if A == B  

:red:`Model`

The **Comparator1Bit model** performs a binary comparison between two input bits.

    Attributes:

       *  A, B (dsignal): Single-bit inputs to compare  
       *  A_gt_B, A_lt_B, A_eq_B (dsignal): Outputs showing comparison result  

    Methods:

        digital(): Logic defining greater than, less than, and equal conditions

.. code-block:: python

    from pyams.lib import dsignal, model

    class Comparator1Bit(model):
        """ 1-bit Digital Comparator """
        def __init__(self, A, B, A_gt_B, A_lt_B, A_eq_B):
            self.A = dsignal(direction='in', port=A)
            self.B = dsignal(direction='in', port=B)

            self.A_gt_B = dsignal(direction='out', port=A_gt_B)
            self.A_lt_B = dsignal(direction='out', port=A_lt_B)
            self.A_eq_B = dsignal(direction='out', port=A_eq_B)

        def digital(self):
            """ Compare single-bit A and B """
            self.A_gt_B += self.A & ~self.B
            self.A_lt_B += ~self.A & self.B
            self.A_eq_B += ~(self.A ^ self.B)

:red:`Command syntax`

The **syntax** for defining a 1-bit comparator in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Comparator1Bit

    # Create an instance
    COMP1 = Comparator1Bit(A, B, A_gt_B, A_lt_B, A_eq_B)
