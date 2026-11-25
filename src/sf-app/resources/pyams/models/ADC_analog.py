#-------------------------------------------------------------------------------
# Name:        ADC_analog (N-bit analog-to-digital converter)
# Updated:     20/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import tanh, floor
from pyams.lib import model, signal, param
from pyams.lib import voltage, current


# ADC Model --------------------------------------------------------------------
class ADC_analog(model):
    """
    N-bit analog-to-digital converter (ideal, continuous-time, flash type).

    Terminals (ain, D):
        ain  analog input (against ground); it draws no current.
        D    list of the N digital output nodes, D[0] = LSB ... D[N-1] = MSB,
             e.g. ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"] (8 bits).
             In the schematic this is a bus pin named D[0:7] wired to a bus
             named D[0:7]; the editor writes the list of its nodes.

    The code follows the input at once:

        code = floor(Vin / Vref * 2^N),  limited to 0 ... 2^N - 1

    and every output node is driven to Voh (bit = 1) or Vol (bit = 0) through
    the output resistance Ro.  The bits change over a small window (Vw, in
    LSB) around each code transition, which keeps the model smooth for the
    Newton iteration.

    Attributes:
        Vi (signal): analog input voltage against ground.
        Vref (param): full-scale voltage (default 5 V): 1 LSB = Vref / 2^N.
        Voh (param): output level of a 1 (default 5 V).
        Vol (param): output level of a 0 (default 0 V).
        Vw (param): width of the code transition, in LSB (default 0.02).
        Ro (param): output resistance of every output (default 100 ohm).
    """
    def __init__(self, ain, D):
        if isinstance(D, str):
            D = [D]
        self.N = len(D)
        self.Vi = signal('in', voltage, ain, '0')
        for i, d in enumerate(D):
            setattr(self, 'Vo%d' % i, signal('in', voltage, d, '0'))
            setattr(self, 'Io%d' % i, signal('out', current, d, '0'))

        self.Vref = param(5.0, 'V', 'Full-scale voltage')
        self.Voh = param(5.0, 'V', 'Output level of a 1')
        self.Vol = param(0.0, 'V', 'Output level of a 0')
        self.Vw = param(0.02, 'LSB', 'Width of the code transition')
        self.Ro = param(100.0, 'Ω', 'Output resistance')

    def analog(self):
        n = 2 ** self.N
        x = float(self.Vi) / self.Vref * n               # input in LSB
        x = min(max(x, 0.5), n - 0.5)                     # codes 0 ... 2^N - 1
        wd = self.Vw
        for i in range(self.N):
            cell = float(2 ** i)                          # a bit flips every `cell` LSB
            m = floor(x / cell)
            r = x - m * cell                              # position inside the cell
            edge = 0.5 * (1.0 + tanh(r / wd)) * 0.5 * (1.0 + tanh((cell - r) / wd))
            bit = edge if (int(m) % 2) == 1 else 1.0 - edge
            target = self.Vol + (self.Voh - self.Vol) * bit
            name = 'Io%d' % i
            setattr(self, name, getattr(self, name) + (getattr(self, 'Vo%d' % i) - target) / self.Ro)
