#-------------------------------------------------------------------------------
# Name:        Combinational digital blocks (dsignal)
# Author:      d.fathi
# Created:     14/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from pyams.lib import model, param, dsignal
from ._digital import pins


def _log2(n, what):
    k = n.bit_length() - 1
    if n < 2 or (1 << k) != n:
        raise ValueError('%s: the number of inputs must be a power of two, got %d' % (what, n))
    return k


class Multiplexer(model):
    """
    Multiplexer 2**k : 1.  The output is the data input selected by the select bus:

        Y = D[S]            (Y <<= (D >> S) & 1)

        M = Multiplexer(["d0", "d1", "d2", "d3"], ["s0", "s1"], "y")      # 4:1
        M = Multiplexer("d", "s", "y", width=8)                           # 8:1, nodes d[0..7], s[0..2]

    Terminals: Multiplexer(ins, sel, y, width=None)
        ins   data input nodes (list, LSB = input 0) or a name + width (number of inputs)
        sel   select nodes (list of k = log2(inputs) nodes) or a name
        y     output node
    Delay and levels: the logic family of dsignal (Tpd, Voh, ...).
    """
    def __init__(self, ins, sel, y, width=None):
        self.D = pins(self, 'D', ins, width, 'in')
        k = _log2(len(self.D), 'Multiplexer')
        self.S = dsignal('in', list(sel)) if isinstance(sel, (list, tuple)) else dsignal('in', sel, width=k)
        if len(self.S) != k:
            raise ValueError('Multiplexer: %d inputs need %d select bits' % (len(self.D), k))
        self.Y = dsignal('out', y)

    def digital(self):
        self.Y <<= (self.D >> self.S) & 1


class Demultiplexer(model):
    """
    Demultiplexer 1 : 2**k.  The input bit goes to the output chosen by the select
    bus, all other outputs are 0:   Y = Din << S

    Terminals: Demultiplexer(din, sel, outs, width=None)
        din   input node;  sel  select nodes (list of k) or a name
        outs  output nodes (list of 2**k) or a name + width (= number of outputs)
    """
    def __init__(self, din, sel, outs, width=None):
        self.Din = dsignal('in', din)
        self.Y = pins(self, 'Y', outs, width, 'out')
        k = _log2(len(self.Y), 'Demultiplexer')
        self.S = dsignal('in', list(sel)) if isinstance(sel, (list, tuple)) else dsignal('in', sel, width=k)
        if len(self.S) != k:
            raise ValueError('Demultiplexer: %d outputs need %d select bits' % (len(self.Y), k))

    def digital(self):
        self.Y <<= self.Din << self.S


class Decoder(model):
    """
    n -> 2**n decoder: output number A is 1, all the others 0 (one-hot):  Y = 1 << A.
    With the enable pin (optional) at 0 every output is inactive.

    Terminals: Decoder(ins, outs, en=None, width=None)
        ins   input nodes (list of n, LSB first) or a name + width (= n)
        outs  output nodes (list of 2**n) or a name
        en    enable (active high), optional
    Parameter: Low  1 = active-low outputs (selected output 0, the others 1)   (0)
    """
    def __init__(self, ins, outs, en=None, width=None):
        self.A = pins(self, 'A', ins, width, 'in')
        n = len(self.A)
        self.Y = dsignal('out', list(outs)) if isinstance(outs, (list, tuple)) else dsignal('out', outs, width=1 << n)
        if len(self.Y) != 1 << n:
            raise ValueError('Decoder: %d inputs need %d outputs' % (n, 1 << n))
        self._has_en = en is not None
        if self._has_en:
            self.En = dsignal('in', en)
        self.Low = param(0.0, ' ', '1 = active-low outputs')

    def digital_reset(self):
        self.Y.reset(self._code(0))

    def _code(self, v):
        full = (1 << len(self.Y)) - 1
        return full ^ v if float(self.Low) > 0.5 else v

    def digital(self):
        on = (self.En if self._has_en else 1)
        self.Y <<= self._code((1 << int(self.A)) if on else 0)


class PriorityEncoder(model):
    """
    Priority encoder 2**k -> k: Q is the number of the highest input that is 1
    (Q = 0 when no input is 1); the optional output Valid is 1 when any input is 1.

    Terminals: PriorityEncoder(ins, outs, valid=None, width=None)
        ins   input nodes (list) or a name + width;  outs  k output nodes or a name
    """
    def __init__(self, ins, outs, valid=None, width=None):
        self.D = pins(self, 'D', ins, width, 'in')
        k = _log2(len(self.D), 'PriorityEncoder')
        self.Q = dsignal('out', list(outs)) if isinstance(outs, (list, tuple)) else dsignal('out', outs, width=k)
        if len(self.Q) != k:
            raise ValueError('PriorityEncoder: %d inputs need %d outputs' % (len(self.D), k))
        self._has_v = valid is not None
        if self._has_v:
            self.Valid = dsignal('out', valid)

    def digital(self):
        v = int(self.D)
        self.Q <<= max(v.bit_length() - 1, 0)
        if self._has_v:
            self.Valid <<= 1 if v else 0


class MagnitudeComparator(model):
    """
    Magnitude comparator of two buses A and B:  Gt = (A > B),  Eq = (A == B),  Lt = (A < B).
    Any of the three outputs may be left out (None).

    Terminals: MagnitudeComparator(a, b, gt=None, eq=None, lt=None, width=None)
        a, b  bus nodes (lists of the same length) or names + width
    """
    def __init__(self, a, b, gt=None, eq=None, lt=None, width=None):
        self.A = pins(self, 'A', a, width, 'in')
        self.B = pins(self, 'B', b, width, 'in')
        if len(self.A) != len(self.B):
            raise ValueError('MagnitudeComparator: A and B must have the same width')
        self._o = []
        for nm, node in (('Gt', gt), ('Eq', eq), ('Lt', lt)):
            if node is not None:
                setattr(self, nm, dsignal('out', node))
                self._o.append(nm)

    def digital(self):
        a, b = int(self.A), int(self.B)
        for nm, res in (('Gt', a > b), ('Eq', a == b), ('Lt', a < b)):
            if nm in self._o:
                getattr(self, nm).set(res)


class ParityGenerator(model):
    """
    Parity bit of a bus: Y = XOR of all bits (even parity: the total number of ones
    including Y is even).  Parameter Odd = 1 gives the odd-parity bit (Y inverted).

    Terminals: ParityGenerator(ins, y, width=None)
    """
    def __init__(self, ins, y, width=None):
        self.D = pins(self, 'D', ins, width, 'in')
        self.Y = dsignal('out', y)
        self.Odd = param(0.0, ' ', '1 = odd parity')

    def digital(self):
        p = bin(int(self.D)).count('1') & 1
        self.Y <<= p ^ (1 if float(self.Odd) > 0.5 else 0)


class BinaryToGray(model):
    """Binary -> Gray code:  G = B ^ (B >> 1).   Terminals: BinaryToGray(ins, outs, width=None)"""
    def __init__(self, ins, outs, width=None):
        self.B = pins(self, 'B', ins, width, 'in')
        self.G = pins(self, 'G', outs, width, 'out')

    def digital(self):
        b = int(self.B)
        self.G <<= b ^ (b >> 1)


class GrayToBinary(model):
    """Gray code -> binary:  B = G ^ (G >> 1) ^ (G >> 2) ^ ...   Terminals: GrayToBinary(ins, outs, width=None)"""
    def __init__(self, ins, outs, width=None):
        self.G = pins(self, 'G', ins, width, 'in')
        self.B = pins(self, 'B', outs, width, 'out')

    def digital(self):
        g = int(self.G)
        b = 0
        while g:
            b ^= g
            g >>= 1
        self.B <<= b


class SevenSegmentDecoder(model):
    """
    BCD / hexadecimal -> seven-segment decoder.  Input: 4 bits (0..15); outputs a, b, c, d, e, f, g
    (a = top, then clockwise, g = middle).  Digits 0-9 and A b C d E F (hex).

    Terminals: SevenSegmentDecoder(ins, outs, width=None)
        ins   4 input nodes (list, LSB first) or a name;  outs  7 nodes (a ... g) or a name
    Parameter: Low  1 = active-low segments (common anode)   (0)
    """
    SEG = (0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07,
           0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71)     # bit0 = a ... bit6 = g

    def __init__(self, ins, outs, width=None):
        self.D = pins(self, 'D', ins, width, 'in') if isinstance(ins, (list, tuple)) else dsignal('in', ins, width=4)
        self.Y = dsignal('out', list(outs)) if isinstance(outs, (list, tuple)) else dsignal('out', outs, width=7)
        if len(self.D) != 4 or len(self.Y) != 7:
            raise ValueError('SevenSegmentDecoder needs 4 input bits and 7 outputs')
        self.Low = param(0.0, ' ', '1 = active-low segments')

    def digital(self):
        v = self.SEG[int(self.D) & 15]
        self.Y <<= (v ^ 0x7F) if float(self.Low) > 0.5 else v
