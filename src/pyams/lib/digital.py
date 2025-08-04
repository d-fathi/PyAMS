#-------------------------------------------------------------------------------
# Name:        digital
# Author:      d.fathi
# Created:     03/04/2025
# Update:      01/05/2025
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

    def __init__(self, direction: str = "out", port: str = '0', value: str = '0', name: str = '', bitwidth: int = None):
        if direction not in {'in', 'out'}:
            raise ValueError("Direction must be 'in' or 'out'")

        self.direction = direction
        self.port = port
        self.pindex = 0
        self._name = name or "dsignal"
        if isinstance(value, int):
            value = bin(value)[2:]
        self.bitwidth = bitwidth or len(value)
        self._validate(value)
        self._value = self._adjust_to_bitwidth(value)

    def _validate(self, value):
        if not all(bit in {'0', '1', 'X', 'Z'} for bit in value):
            raise ValueError("Value must contain only '0', '1', 'X', or 'Z'")

    def _adjust_to_bitwidth(self, value: str) -> str:
        if len(value) > self.bitwidth:
            return value[-self.bitwidth:]
        else:
            return value.zfill(self.bitwidth)

    @property
    def value(self) -> str:
        return self._value

    @value.setter
    def value(self, new_value: str):
        if isinstance(new_value, int):
            new_value = bin(new_value)[2:]
        self._validate(new_value)
        self._value = self._adjust_to_bitwidth(new_value)

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
        if isinstance(other, int):
            other = bin(other)[2:]
        if isinstance(other, str):
            other = dsignal(self.direction, self.port, other)
        if not isinstance(other, dsignal):
            raise TypeError("Operand must be dsignal, int, or str")

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
    def __rand__(self, other): return self._bitwise_operation(other, 'AND')
    def __ror__(self, other): return self._bitwise_operation(other, 'OR')
    def __rxor__(self, other): return self._bitwise_operation(other, 'XOR')

    def __invert__(self):
        result = ''.join('0' if bit == '1' else '1' if bit == '0' else 'X' for bit in self.value)
        return dsignal(self.direction, self.port, result)

    def _to_decimal(self):
        return int(self.value.replace('X', '0').replace('Z', '0'), 2)

    def _from_decimal(self, num, length):
        bin_str = bin(num & ((1 << length) - 1))[2:]
        return bin_str.zfill(length)

    def _ensure_dsignal(self, other):
        if isinstance(other, int):
            other = self._from_decimal(other, len(self.value))
        if isinstance(other, str):
            other = dsignal(self.direction, self.port, other)
        return other

    def __add__(self, other):
        other = self._ensure_dsignal(other)
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() + other._to_decimal(), len(self.value)))
    def __sub__(self, other):
        other = self._ensure_dsignal(other)
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() - other._to_decimal(), len(self.value)))
    def __truediv__(self, other):
        other = self._ensure_dsignal(other)
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() // other._to_decimal(), len(self.value)))
    def __mod__(self, other):
        other = self._ensure_dsignal(other)
        return dsignal(self.direction, self.port, self._from_decimal(self._to_decimal() % other._to_decimal(), len(self.value)))

    def __radd__(self, other): return self + other
    def __rsub__(self, other): return dsignal(self.direction, self.port, self._from_decimal(other - self._to_decimal(), len(self.value)))
    def __rtruediv__(self, other): return dsignal(self.direction, self.port, self._from_decimal(other // self._to_decimal(), len(self.value)))
    def __rmod__(self, other): return dsignal(self.direction, self.port, self._from_decimal(other % self._to_decimal(), len(self.value)))

    def __iadd__(self, other):
        self.value = other.value
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

    def __lshift__(self, bits):
        if not isinstance(bits, int):
            raise TypeError("Shift amount must be an integer")
        shifted_value = self.value[bits:] + '0' * bits
        return dsignal(self.direction, self.port, shifted_value)

    def __rshift__(self, bits):
        if not isinstance(bits, int):
            raise TypeError("Shift amount must be an integer")
        shifted_value = '0' * bits + self.value
        shifted_value = shifted_value[:len(self.value)]
        return dsignal(self.direction, self.port, shifted_value)



def digitalValue(val):
    return dsignal(direction='in', port='0', value=val)




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
        self.x=[]

        self.Vih=3.5
        self.Vil=0.5

        self.Voh=5
        self.Vol=0

    def addDigitalElement(self,elm):
        if hasattr(elm, 'digital') and callable(getattr(elm, 'digital')):
            self.cir+=[elm]
            self.elem[elm.name]=elm

    def classifyInOutSignals(self):
        """
        classify input and output dsignals from the digital circuit.
            - inDSignals: List of input digital signals with details. (pos node , dsignal)
            - outDSignals: List of output digital signals with details. (pos node , dsignal)
            - dsignals:  Collect all signals from circuit elements.
        """
        self.inDSignals=[]
        self.outDSignals=[]
        self.dsignals=[]

        for name, element in self.elem.items():
            self.dsignals+=element.getDSignals()

        for i in range(len(self.dsignals)):
            signal_=self.dsignals[i]

            if signal_.port in self.nodes:
                signal_.pindex = self.nodes.index(signal_.port)
            else:
                self.nodes.append(signal_.port)
                signal_.pindex= self.nodes.index(signal_.port)

            if signal_.direction=='in':
               self.inDSignals+=[[signal_,signal_.pindex]]
            else:
               self.outDSignals+=[[signal_,signal_.pindex]]

        self.x = ['0'] * len(self.nodes)

    def convertMixedValues(self,parent):
        '''
        for mixed signals convert values
        Analog to Digital and Digital to Analog)
        '''
         #for mixed signals (Analog to Digital)
        self.Vih=parent.option.Vih            # Logic High for Minimum Input Voltage
        self.Vil=parent.option.Vil            # Logic Low for Maximum Input Voltage
        #for mixed signals (Digital to Analog)
        self.Voh=parent.option.Voh            # Output Voltage for Logic High
        self.Vol=parent.option.Vol            # Output Voltage for Logic Low


    def findMixedSignals(self,parent):
        """
        Find mixed signals in the circuit.
        """
        from pyams.lib.cpyams import signal,voltage
        analogNodes=parent.nodes
        self.convertMixedValues(parent)

        self.inNodes=[]
        self.outNodes=[]
        self.digital_analog=[]
        self.analog_digital=[]
        self.pCircuit=parent

        for i in range(len(self.dsignals)):
            signal_=self.dsignals[i]
            if signal_.port in analogNodes:
                if signal_.direction=='in':
                    self.inNodes+=[self.nodes.index(signal_.port)]
                    self.analog_digital+=[parent.nodes.index(signal_.port)]
                else:
                    self.outNodes+=[self.nodes.index(signal_.port)]
                    newSignal=signal('out',voltage,signal_.port)
                    newSignal.value=0
                    self.digital_analog+=[newSignal]
                    parent.outSignals+=[[True,parent.nodes.index(signal_.port),0,newSignal]]

    def executeMixedSignals(self):
        """
        Execute mixed signals in the circuit.
        """
        self.ax=self.pCircuit.x
        for i in range(len(self.analog_digital)):
            pos_a=self.analog_digital[i]-1
            pos_d=self.inNodes[i]
            if self.ax[pos_a]<=self.Vil:
                self.x[pos_d]='0'
            elif self.ax[pos_a]>=self.Vih:
                self.x[pos_d]='1'

        for i in range(len(self.digital_analog)):
            pos_d=self.outNodes[i]
            signal_=self.digital_analog[i]

            if self.x[pos_d]=='0':
                signal_.value=self.Vol
            elif self.x[pos_d]=='1':
                signal_.value=self.Voh

            ''''
            else:
                self.x[self.analog_digital[i]]='X'
            '''


    def feval(self):
      """
      Evaluate the circuit digital
      """
      for i in range(len(self.cir)):
         for  signal,pos in self.outDSignals:
            self.x[pos] =signal.value

         for  signal,pos in self.inDSignals:
            signal.value = self.x[pos]

         self.executeMixedSignals()

         for element in self.cir:
             element.digital()







# Example usage
if __name__ == '__main__':
    A = dsignal(value="1101")
    B = dsignal(value="1011")

    print("A & B =", (A & B).value)
    print("A | 5 =", (A | 5).value)
    print("3 ^ A =", (3 ^ A).value)
    print("~A =", (~A).value)
    print("A + 2 =", (A + 2).value)
    print("A - 2 =", (A - 2).value)

    B = dsignal(value="0000")
    B+=B+"000"
    print("B =", B.value)
    B+=B+1
    print("B =", B.value)
    B+=B+1
    print("B =", B.value)
