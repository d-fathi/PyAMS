#-------------------------------------------------------------------------------
# Name:        DAC_clocked (N-bit DAC with an input register on a clock)
# Updated:     20/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time


# DAC_clocked Model ------------------------------------------------------------
class DAC_clocked(model):
    """
    N-bit digital-to-analog converter with an input register: the digital
    input is captured on the rising edge of a clock and the output is held
    until the next edge.

    Terminals (D, clk, out):
        D    list of the N digital input nodes, D[0] = LSB ... D[N-1] = MSB,
             e.g. ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"].
             In the schematic this is a bus pin named D[0:7].
        clk  clock input (against ground).
        out  analog output (against ground).
    The inputs and the clock draw no current.

    At the rising edge of the clock (clk crosses Vth upwards) every input
    node is read (a logic 1 above the level Vlogic) and the code is stored:

        code = b0 + 2 b1 + ... + 2^(N-1) b(N-1)
        Vout = Vref * code / 2^N     through Ro, with the time constant Tau

    The inputs are read at the instant of the edge (linear interpolation
    between the two accepted points around it), i.e. before the outputs of
    the circuit driving the bus have reacted to this same edge.  As for the
    ADC_clocked model, the clock needs a finite rise time and the time step
    must be small enough to follow it (option max_step of the analysis).

    Attributes:
        Vo (signal): output voltage.  Io (signal): output current.
        Vref (param): reference (full-scale) voltage (default 5 V).
        Vth (param): clock threshold (default 2.5 V).
        Vlogic (param): logic threshold of the inputs (default 2.5 V).
        Ro (param): output resistance (default 1 ohm).
        Tau (param): output time constant (default 10 ns).
    """
    def __init__(self, D, clk, out):
        if isinstance(D, str):
            D = [D]
        self.N = len(D)
        for i, d in enumerate(D):
            setattr(self, 'Vb%d' % i, signal('in', voltage, d, '0'))
        self.Vc = signal('in', voltage, clk, '0')
        self.Vo = signal('in', voltage, out, '0')
        self.Io = signal('out', current, out, '0')

        self.Vref = param(5.0, 'V', 'Reference (full-scale) voltage')
        self.Vth = param(2.5, 'V', 'Clock threshold')
        self.Vlogic = param(2.5, 'V', 'Logic threshold of the inputs')
        self.Ro = param(1.0, 'Ω', 'Output resistance')
        self.Tau = param(10.0e-9, 's', 'Output time constant')
        self._code = 0
        self._prev = None            # (clk, [bit voltages]) at the previous accepted point
        self._tlast = 0.0

    def analog(self):
        vc = float(self.Vc)
        vb = [float(getattr(self, 'Vb%d' % i)) for i in range(self.N)]
        dv = ddt(self.Vo)                            # keeps the element stateful
        if accepting():
            t = float(time)
            if t < self._tlast:                      # a new run starts
                self._code = 0
                self._prev = None
            self._tlast = t
            vth = float(self.Vth)
            if self._prev is not None and self._prev[0] < vth <= vc:
                a = (vth - self._prev[0]) / (vc - self._prev[0])
                code = 0
                for i in range(self.N):
                    v = self._prev[1][i] + a * (vb[i] - self._prev[1][i])
                    if v > float(self.Vlogic):
                        code += 1 << i
                self._code = code
            self._prev = (vc, vb)
            return
        target = self.Vref * self._code / (2 ** self.N)
        self.Io += (self.Vo - target) / self.Ro + (self.Tau / self.Ro) * dv
