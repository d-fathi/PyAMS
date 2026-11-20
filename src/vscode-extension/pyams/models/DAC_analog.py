#-------------------------------------------------------------------------------
# Name:        DAC_analog (N-bit digital-to-analog converter)
# Updated:     20/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import tanh
from pyams.lib import model, signal, param
from pyams.lib import voltage, current


# DAC Model --------------------------------------------------------------------
class DAC_analog(model):
    """
    N-bit digital-to-analog converter.

    Terminals (D, out):
        D    list of the N digital input nodes, D[0] = LSB ... D[N-1] = MSB,
             e.g. ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"] (8 bits).
             In the schematic this is a bus pin named D[0:7] wired to a bus
             named D[0:7]; the editor writes the list of its nodes.
        out  analog output (against ground).

    A node is a logic 1 when its voltage is above the threshold Vth (a smooth
    transition of width Vw is used, so the Newton iteration never meets a
    discontinuity).  The inputs draw no current.  With the code

        code = b0 + 2 b1 + 4 b2 + ... + 2^(N-1) b(N-1)

    the output is  Vout = Vref * code / 2^N  (so the full scale is
    Vref * (1 - 2^-N)), delivered through the output resistance Ro:

        Io = (Vo - Vout) / Ro

    Attributes:
        Vo (signal): output voltage against ground.
        Io (signal): output current from the output node to ground.
        Vref (param): reference (full-scale) voltage (default 5 V).
        Vth (param): logic threshold of the inputs (default 2.5 V).
        Vw (param): width of the logic transition (default 0.05 V).
        Ro (param): output resistance (default 1 ohm).
    """
    def __init__(self, D, out):
        if isinstance(D, str):
            D = [D]
        self.N = len(D)
        for i, d in enumerate(D):
            setattr(self, 'Vb%d' % i, signal('in', voltage, d, '0'))
        self.Vo = signal('in', voltage, out, '0')
        self.Io = signal('out', current, out, '0')

        self.Vref = param(5.0, 'V', 'Reference (full-scale) voltage')
        self.Vth = param(2.5, 'V', 'Logic threshold of the inputs')
        self.Vw = param(0.05, 'V', 'Width of the logic transition')
        self.Ro = param(1.0, 'Ω', 'Output resistance')

    def analog(self):
        code = 0.0
        for i in range(self.N):
            v = float(getattr(self, 'Vb%d' % i))
            code += (2 ** i) * 0.5 * (1.0 + tanh((v - self.Vth) / self.Vw))
        vout = self.Vref * code / (2 ** self.N)
        self.Io += (self.Vo - vout) / self.Ro
