#-------------------------------------------------------------------------------
# Name:        N-bit digital-to-analog converter
# Updated:     12/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import model, param, signal, dsignal, voltage, current, ddt
from ._digital import pins


class DAC(model):
    """
    N-bit digital-to-analog converter:

        Vout = Vref * code / 2**N,      code = sum(bit_i * 2**i)

    The input is a bus B (bit 0 = LSB); the output is an analog node.

        D = DAC(["b0", "b1", "b2", "b3"], "aout")       # 4 bits, b0 = LSB
        D = DAC("b", "aout", width=8)                   # nodes b[0] .. b[7]

    Terminals: DAC(ins, out, width=None)
    Parameters:
        Vref  full-scale reference (V)                       5
        Tpd   conversion delay (s)                           10 ns
        Rout, Cout  analog output stage                      100 ohm, 10 pF
        Vol, Voh, Vil, Vih  logic levels of the input bits
    The output follows the code after Tpd and settles with Rout * Cout.
    """
    digital_state = ('code',)

    def __init__(self, ins, out, width=None):
        self.B = pins(self, 'B', ins, width, 'in')
        self.Vout = signal('in', voltage, out, '0')
        self.Iout = signal('out', current, out, '0')
        self.Vref = param(5.0, 'V', 'Full-scale reference')
        self.code = 0

    def digital_reset(self):
        self.code = 0

    def digital(self):
        self.after(float(self.Tpd), 'code', int(self.B))

    def analog(self):
        v = float(self.Vout)
        target = float(self.Vref) * self.code / (1 << len(self.B))
        self.Iout += (v - target) / float(self.Rout) + float(self.Cout) * ddt(v)
