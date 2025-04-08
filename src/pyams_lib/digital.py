#-------------------------------------------------------------------------------
# Name:        digital
# Author:      d.fathi
# Created:     03/04/2025
# Copyright:   (c) pyams 2025
# Licence:     free GPLv3
#-------------------------------------------------------------------------------

class dsignal:
    """
    dsignal is a binary signal model that supports logical and arithmetic operations.
    It can handle binary values ('0', '1') as well as undefined values ('X', 'Z').
    Supports logical operations such as AND, OR, XOR, NOT, and arithmetic operations such as addition, subtraction, division, and modulus.
    Designed for use in digital circuits with input/output port support.
    """
    def __init__(self, direction: str="out", port: str = '0', value: str='0', name: str = ''):
        # Validate direction
        if direction not in {'in', 'out'}:
            raise ValueError("Direction must be 'in' or 'out'")

        self.direction = direction
        self.port = port
        self._validate(value)
        self._value = value
        self._name = name or "dsignal"

    def _validate(self, value):
        """Ensure the value contains only '0', '1', 'X', 'Z'"""
        if not all(bit in {'0', '1', 'X', 'Z'} for bit in value):
            raise ValueError("Value must contain only '0', '1', 'X', or 'Z'")

    @property
    def value(self) -> str:
        return self._value

    @value.setter
    def value(self, new_value: str):
        self._validate(new_value)
        self._value = new_value

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, new_name: str):
        if not isinstance(new_name, str):
            raise TypeError("Name must be a string")
        self._name = new_name

    def __str__(self):
        return f"{self.name} ({self.direction}): {self.value} on port {self.port}"

    def _bitwise_operation(self, other, op):
        """Perform logical operations with support for X and Z values."""
        if not isinstance(other, dsignal):
            raise TypeError("Operand must be an instance of dsignal")

        min_length = min(len(self.value), len(other.value))
        result = ''
        for i in range(min_length):
            a, b = self.value[i], other.value[i]

            if op == 'AND':
                result += '1' if a == '1' and b == '1' else ('0' if a == '0' or b == '0' else 'X')
            elif op == 'OR':
                result += '1' if a == '1' or b == '1' else ('0' if a == '0' and b == '0' else 'X')
            elif op == 'XOR':
                result += 'X' if 'X' in (a, b) else str(int(a != b))

        return dsignal(self.direction, self.port, result)

    def __and__(self, other): return self._bitwise_operation(other, 'AND')
    def __or__(self, other): return self._bitwise_operation(other, 'OR')
    def __xor__(self, other): return self._bitwise_operation(other, 'XOR')

    def __invert__(self):
        """Perform NOT operation with support for 'X' and 'Z'"""
        result = ''.join('0' if bit == '1' else '1' if bit == '0' else 'X' for bit in self.value)
        return dsignal(self.direction, self.port, result)

    def _to_decimal(self):
        """Convert the binary value to a decimal number."""
        return int(self.value.replace('X', '0').replace('Z', '0'), 2)

    def _from_decimal(self, num, length):
        """Convert a decimal number to a `dsignal` value with the same original length."""
        return bin(num)[2:].zfill(length)

    def __add__(self, other):
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() + other._to_decimal(), len(self.value)))
    def __sub__(self, other):
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() - other._to_decimal(), len(self.value)))
    def __truediv__(self, other):
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() // other._to_decimal(), len(self.value)))
    def __mod__(self, other):
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() % other._to_decimal(), len(self.value)))

    def __iadd__(self, other):
        self.value =  other.value
        return self
    def __isub__(self, other):
        self.value = (self - other).value
        return self
    def __itruediv__(self, other):
        self.value = (self / other).value
        return self
    def __imod__(self, other):
        self.value = (self % other).value
        return self


class dcircuit:
    """
    Represents an digital circuit with elements and nodes.
    """
    def __init__(self):
        """
        Initialize an empty circuit with a ground node ('0').
        """

        self.elem = {}  # Dictionary to store digital elements by name
        self.cir= []    # list of digital elments in circuit
        self.nodes = ['0']  # List of digital nodes, starting with ground
        self.outputs=[]
        self.tempOutputs=[]

    def addDigitalElement(self,elm):
        if hasattr(elm, 'digital') and callable(getattr(elem, 'digital')):
            self.cir+=[elm]
            self.elem[elem.name]=elm



if __name__ == '__main__':

  # Example usage
  A = dsignal("out", "A", "1")
  B = dsignal("out", "B", "1")
  C = dsignal("out", "C", "0000")

  print("A      =", A)
  print("B      =", B)
  C += A + B  # Perform C += A + B as an arithmetic operation
  print("C += A + B  =", C)
  print("A - B  =", A - B)   # Subtraction
  print("A / B  =", A / B)   # Division
  print("A % B  =", A % B)   # Modulus


  class AND:
    def __init__(self,In1,In2,Out):
        self.In1=dsignal('in',In1,'11')
        self.In2=dsignal('in',In2,'11')
        self.Out=dsignal('out',Out)


    def digital(self):
        self.Out+=self.In1+self.In2
        print(self.Out)
        self.Out+=self.In1+self.In2
        print(self.Out)

