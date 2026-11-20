#-------------------------------------------------------------------------------
# Name:        ADC_clocked (N-bit ADC sampling on a clock)
# Updated:     20/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from math import tanh, floor
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time


# ADC_clocked Model ------------------------------------------------------------
class ADC_clocked(model):
    """
    N-bit analog-to-digital converter that samples its input on the rising
    edge of a clock (a sample-and-hold ADC).

    Terminals (ain, clk, D):
        ain  analog input (against ground); draws no current.
        clk  clock input (against ground); draws no current.
        D    list of the N digital output nodes, D[0] = LSB ... D[N-1] = MSB,
             e.g. ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"].
             In the schematic this is a bus pin named D[0:7].

    At every rising edge of the clock (clk crosses the threshold Vth upwards)
    the input is sampled:

        code = floor(Vin / Vref * 2^N),  limited to 0 ... 2^N - 1

    and the code is held until the next edge.  The outputs are driven to
    Voh / Vol through the output resistance Ro, with the time constant Tau
    (the delay of the outputs after the edge).

    The state changes only when a time point is accepted.  The input is
    taken at the moment the clock crosses Vth (linear interpolation between
    the two accepted points around the edge), so the sampling instant does
    not depend on the size of the time step; but the clock needs a finite
    rise time and the step must be small enough to follow it (use the option
    max_step of the analysis, e.g. 1/20 of the clock period).

    Attributes:
        Vi (signal): analog input voltage.   Vc (signal): clock voltage.
        Vref (param): full-scale voltage (default 5 V).
        Vth (param): clock threshold (default 2.5 V).
        Voh, Vol (param): output levels of a 1 and a 0 (default 5 V, 0 V).
        Ro (param): output resistance (default 100 ohm).
        Tau (param): output time constant (default 10 ns).
    """
    def __init__(self, ain, clk, D):
        if isinstance(D, str):
            D = [D]
        self.N = len(D)
        self.Vi = signal('in', voltage, ain, '0')
        self.Vc = signal('in', voltage, clk, '0')
        for i, d in enumerate(D):
            setattr(self, 'Vo%d' % i, signal('in', voltage, d, '0'))
            setattr(self, 'Io%d' % i, signal('out', current, d, '0'))

        self.Vref = param(5.0, 'V', 'Full-scale voltage')
        self.Vth = param(2.5, 'V', 'Clock threshold')
        self.Voh = param(5.0, 'V', 'Output level of a 1')
        self.Vol = param(0.0, 'V', 'Output level of a 0')
        self.Ro = param(100.0, 'Ω', 'Output resistance')
        self.Tau = param(10.0e-9, 's', 'Output time constant')
        self._code = 0
        self._prev = None            # (clk, ain) at the previous accepted point
        self._tlast = 0.0

    def analog(self):
        n = 2 ** self.N
        vc = float(self.Vc)
        vi = float(self.Vi)
        dv = [ddt(getattr(self, 'Vo%d' % i)) for i in range(self.N)]   # keeps the element stateful
        if accepting():
            t = float(time)
            if t < self._tlast:                      # a new run starts
                self._code = 0
                self._prev = None
            self._tlast = t
            vth = float(self.Vth)
            if self._prev is not None and self._prev[0] < vth <= vc:
                a = (vth - self._prev[0]) / (vc - self._prev[0])
                vs = self._prev[1] + a * (vi - self._prev[1])      # input at the edge
                code = int(floor(vs / float(self.Vref) * n))
                self._code = max(0, min(n - 1, code))
            self._prev = (vc, vi)
            return
        for i in range(self.N):
            bit = (self._code >> i) & 1
            target = self.Vol + (self.Voh - self.Vol) * bit
            name = 'Io%d' % i
            setattr(self, name, getattr(self, name) +
                    (getattr(self, 'Vo%d' % i) - target) / self.Ro + (self.Tau / self.Ro) * dv[i])
