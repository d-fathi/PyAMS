.. include:: ../importCSS.txt

4-bit Digital Comparator
=========================

:red:`Information`

.. figure:: Comparator4bit.png
   :scale: 50%
   :align: center

A **4-bit Digital Comparator** compares two 4-bit binary numbers and determines if one is **greater than**, **less than**, or **equal to** the other. It is used in digital systems for sorting, control logic, and arithmetic operations.

:red:`Ports`

- **A0** to **A3**: Bits of the first 4-bit input (A = A3A2A1A0)  
- **B0** to **B3**: Bits of the second 4-bit input (B = B3B2B1B0)  
- **A_gt_B**: Output is high if A > B  
- **A_lt_B**: Output is high if A < B  
- **A_eq_B**: Output is high if A == B  

:red:`Model`

The **Comparator4Bit model** compares two 4-bit binary numbers and outputs the result of the comparison.

    Attributes:

       *  A0–A3 (dsignal): 4-bit binary input A  
       *  B0–B3 (dsignal): 4-bit binary input B  
       *  A_gt_B, A_lt_B, A_eq_B (dsignal): Comparison outputs  

    Methods:

        digital(): Implements logic to compare 4-bit numbers A and B

.. code-block:: python

    from pyams.lib import dsignal, model

    class Comparator4Bit(model):
        """ 4-bit Digital Comparator """
        def __init__(self, A0, A1, A2, A3, B0, B1, B2, B3, A_gt_B, A_lt_B, A_eq_B):
            self.A0 = dsignal(direction='in', port=A0)
            self.A1 = dsignal(direction='in', port=A1)
            self.A2 = dsignal(direction='in', port=A2)
            self.A3 = dsignal(direction='in', port=A3)

            self.B0 = dsignal(direction='in', port=B0)
            self.B1 = dsignal(direction='in', port=B1)
            self.B2 = dsignal(direction='in', port=B2)
            self.B3 = dsignal(direction='in', port=B3)

            self.A_gt_B = dsignal(direction='out', port=A_gt_B)
            self.A_lt_B = dsignal(direction='out', port=A_lt_B)
            self.A_eq_B = dsignal(direction='out', port=A_eq_B)

        def digital(self):
            """ Perform 4-bit binary comparison """
            a = [self.A3, self.A2, self.A1, self.A0]
            b = [self.B3, self.B2, self.B1, self.B0]

            equal = ~(a[3] ^ b[3]) & ~(a[2] ^ b[2]) & ~(a[1] ^ b[1]) & ~(a[0] ^ b[0])
            self.A_eq_B += equal

            gt = (a[3] & ~b[3]) | \
                 (~a[3] & ~b[3] & a[2] & ~b[2]) | \
                 (~a[3] & ~b[3] & ~a[2] & ~b[2] & a[1] & ~b[1]) | \
                 (~a[3] & ~b[3] & ~a[2] & ~b[2] & ~a[1] & ~b[1] & a[0] & ~b[0])
            self.A_gt_B += gt

            lt = (~a[3] & b[3]) | \
                 (~a[3] & ~b[3] & ~a[2] & b[2]) | \
                 (~a[3] & ~b[3] & ~a[2] & ~b[2] & ~a[1] & b[1]) | \
                 (~a[3] & ~b[3] & ~a[2] & ~b[2] & ~a[1] & ~b[1] & ~a[0] & b[0])
            self.A_lt_B += lt

:red:`Command syntax`

To define a 4-bit comparator in a PyAMS simulation:

.. code-block:: python

    # Import the model
    from pyams.models import Comparator4Bit

    # Instantiate the model
    COMP4 = Comparator4Bit(A0, A1, A2, A3, B0, B1, B2, B3, A_gt_B, A_lt_B, A_eq_B)
