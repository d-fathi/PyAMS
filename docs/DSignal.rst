dsignal Class
=============

Overview
--------

The ``dsignal`` class represents a digital signal used in logic circuit simulations. It is designed to model binary signals that may consist of valid logic levels ('0', '1') as well as undefined or high-impedance states ('X', 'Z'). This makes it ideal for emulating real-world behavior in digital systems such as processors, FPGAs, and custom logic circuits.

Key Features
------------

- Supports binary values: '0', '1', 'X', and 'Z'
- Performs bitwise logical operations: AND, OR, XOR, NOT
- Performs arithmetic operations: addition (+), subtraction (-), division (/), modulus (%)
- Accepts interaction with int and str for arithmetic and logic operations
- Supports input/output directionality for port modeling
- Enforces a fixed bit width (bitwidth), automatically adjusting values to fit

Class Definition
----------------

.. code-block:: python

   class dsignal:
       def __init__(self, direction="out", port='0', value='0', name='', bitwidth=None)

Constructor Parameters:

- ``direction``: Direction of the signal, either ``"in"`` or ``"out"``.
- ``port``: Port name or number the signal is associated with.
- ``value``: Initial binary string representing the signal state.
- ``name``: Optional name for identifying the signal.
- ``bitwidth``: Maximum number of bits allowed for the signal value.

Behavior
--------

- **Validation**: Only accepts characters '0', '1', 'X', and 'Z'.
- **Bit Width Enforcement**: If the input value exceeds the specified bitwidth, it is truncated from the left. If shorter, it is zero-padded from the left.
- **String Representation**: Returns a human-readable string showing signal name, direction, value, and port.

Supported Operations
--------------------

Logical Operations
^^^^^^^^^^^^^^^^^^

The following bitwise logic operations are supported, including with ``dsignal``, ``int``, or ``str`` operands:

- ``&`` : Bitwise AND
- ``|`` : Bitwise OR
- ``^`` : Bitwise XOR
- ``~`` : Bitwise NOT
- ``<<`` : Logical left shift
- ``>>`` : Logical right shift

Arithmetic Operations
^^^^^^^^^^^^^^^^^^^^^

Arithmetic operations are performed after converting the signal value to decimal:

- ``+`` : Addition (supports int, str, or dsignal)
- ``-`` : Subtraction
- ``/`` : Integer division
- ``%`` : Modulo
- ``-=``, ``/=`` and ``%=`` for in-place operations
- ``+=``: It equals operations ``=``

All results are adjusted to match the original bitwidth.

Usage in Logic Circuits
-----------------------

The ``dsignal`` class is intended for use as a signal wire between digital components such as logic gates, multiplexers, or ALUs.

Example:

.. code-block:: python

   class AND:
       def __init__(self, In1, In2, Out):
           self.In1 = dsignal('in', In1, '11', bitwidth=2)
           self.In2 = dsignal('in', In2, '11', bitwidth=2)
           self.Out = dsignal('out', Out, bitwidth=2)

       def digital(self):
           self.Out += self.In1 & self.In2
           print(self.Out)

Example Usage
-------------

.. code-block:: python

   A = dsignal("out", "A", "1", bitwidth=4)
   B = dsignal("out", "B", "1", bitwidth=4)
   C = dsignal("out", "C", "0000", bitwidth=4)

   C += A + B
   print("C:", C)  # Output: C (out): 0010 on port C

You can also use integers and strings directly:

.. code-block:: python

   A = dsignal("out", "A", "0010", bitwidth=4)
   A += A+1
   A &= "1101"
   print("A:", A)

Conclusion
----------

The ``dsignal`` class abstracts signal-level behavior in digital circuits, providing a programmable and extensible way to simulate logic and arithmetic interactions between components. It is an essential building block for digital design simulation and educational tools.
