#-------------------------------------------------------------------------------
# Name:        N-bit analog-to-digital converter
# Updated:     12/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from math import floor
from pyams.lib import model, param, signal, dsignal, voltage
from ._digital import pins


class ADC(model):
    """
    N-bit analog-to-digital converter, sampling on the rising edge of Clk:

        code = floor(Vin / Vref * 2**N), limited to 0 .. 2**N - 1

    The result appears on the output bus D (LSB first) after the conversion
    time Tpd.  The analog input draws no current.

        A = ADC("ain", "clk", ["d0", "d1", "d2", "d3"])      # 4 bits
        A = ADC("ain", "clk", "d", width=8)                  # nodes d[0] .. d[7]

    Terminals: ADC(ain, clk, outs, width=None)
    Parameters:
        Vref  full-scale reference (V)         5
        Tpd   conversion time (s)              10 ns
    and the logic family of dsignal (Voh, Vol, Rout, Cout, Vil, Vih).
    The code can be recorded with setOutPuts("A1.D").
    """
    def __init__(self, ain, clk, outs, width=None):
        self.Ain = signal('in', voltage, ain, '0')
        self.Clk = dsignal('in', clk)
        self.D = pins(self, 'D', outs, width, 'out')
        self.Vref = param(5.0, 'V', 'Full-scale reference')

    def digital(self):
        if self.Clk.rising:
            full = 1 << len(self.D)
            code = int(floor(float(self.Ain) / float(self.Vref) * full))
            self.D <<= max(0, min(full - 1, code))
