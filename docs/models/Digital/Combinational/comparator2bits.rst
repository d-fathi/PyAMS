.. include:: ../importCSS.txt

Digital Comparator
===================

:red:`Information`

.. figure:: Comparator.png
   :scale: 50%
   :align: center

A **Digital Comparator** is a combinational circuit that compares two binary numbers and determines their relative magnitudes. It outputs one or more signals indicating whether the first number is **greater than**, **less than**, or **equal to** the second number.

:red:`Ports`

- **A0**, **A1**: First 2-bit binary number (A = A1A0)  
- **B0**, **B1**: Second 2-bit binary number (B = B1B0)  
- **A_gt_B**: Output is high if A > B  
- **A_lt_B**: Output is high if A < B  
- **A_eq_B**: Output is high if A == B  

:red:`Model`

The **Comparator2Bit model** compares two 2-bit binary numbers and outputs logic levels indicating the comparison result.

    Attributes:

       *  A0, A1 (dsignal): Bits of input A  
       *  B0, B1 (dsignal): Bits of input B  
       *  A_gt_B, A_lt_B, A_eq_B (dsignal): Comparison result outputs  

    Methods:

        digital(): Implements logic for greater than, less than, and equal comparison

.. code-block:: python

    from pyams.lib import dsignal, model

    class Comparator2Bit(model):
        """ 2-bit Digital Comparator """
        def __init__(self, A0, A1, B0, B1, A_gt_B, A_lt_B, A_eq_B):
            self.A0 = dsignal(direction='in', port=A0)
            self.A1 = dsignal(direction='in', port=A1)
            self.B0 = dsignal(direction='in', port=B0)
            self.B1 = dsignal(direction='in', port=B1)

            self.A_gt_B = dsignal(direction='out', port=A_gt_B)
            self.A_lt_B = dsignal(direction='out', port=A_lt_B)
            self.A_eq_B = dsignal(direction='out', port=A_eq_B)

        def digital(self):
            """ Compare A1A0 to B1B0 """
            a1, a0 = self.A1, self.A0
            b1, b0 = self.B1, self.B0

            # Equal condition
            self.A_eq_B += ~(a1 ^ b1) & ~(a0 ^ b0)

            # Greater than condition
            self.A_gt_B += (a1 & ~b1) | (~a1 & ~b1 & a0 & ~b0) | (a1 & b1 & a0 & ~b0)

            # Less than condition
            self.A_lt_B += (~a1 & b1) | (a1 & b1 & ~a0 & b0) | (~a1 & ~b1 & ~a0 & b0)

:red:`Command syntax`

The **syntax** for defining a 2-bit digital comparator in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Comparator2Bit

    # Create the comparator instance
    COMP = Comparator2Bit(A0, A1, B0, B1, A_gt_B, A_lt_B, A_eq_B)
