#-------------------------------------------------------------------------------
# Name:        Comparator (voltage comparator with saturated output, hysteresis)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from math import tanh
from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time


# Comparator Model -------------------------------------------------------------
class Comparator(model):
    """
    Voltage comparator: the output goes to the high level Voh when the
    differential input Vd = V(p) - V(n) + Vos is positive and to the low level
    Vol when it is negative, with an optional built-in hysteresis Vhys.

    Terminals (p, n, out): non-inverting input (+), inverting input (-) and
    output.  The inputs draw no current.

    Compared with the OpAmp model:
      * the two output levels are free (Vol ... Voh, e.g. 0 ... 5 V logic);
      * the hysteresis is built in: with Vhys > 0 the output switches high
        when Vd rises above +Vhys/2 and low when Vd falls below -Vhys/2
        (between the two thresholds it keeps its last state), so a noisy or
        slowly varying input does not make it chatter.

    Equations (Vmid = (Voh + Vol)/2, Vh = (Voh - Vol)/2, Vd' = Vd + Vos):

        threshold  = +Vhys/2 while the state is low, -Vhys/2 while it is high
        Vtarget    = Vmid + Vh * tanh(A * (Vd' - threshold) / Vh)
        Iout       = (Vo - Vtarget)/Ro + (Tau/Ro) * dVo/dt

    The state (low/high) changes only when a time point is accepted (see
    ``accepting()``), never inside a Newton iteration; in a DC sweep it
    changes after each point, so running a sweep up and then down draws the
    hysteresis loop.  The delay of the comparator is set by Tau (the output
    reaches half of its swing about 0.7 Tau after the input crosses the
    threshold); a nonzero Tau is also what lets the solver follow the
    switching.

    Attributes:
        Vd (signal): differential input between p and n.
        Vo (signal): output voltage, measured against ground.
        Io (signal): output current from the output node to ground.
        Voh (param): high output level (default 5 V).
        Vol (param): low output level (default 0 V).
        Vhys (param): total hysteresis width (default 0 V = no hysteresis).
        Vos (param): input offset voltage (default 0 V).
        A (param): gain of the transition region (default 1e5): the output
                   goes through its swing within Vh/A of the threshold.
        Ro (param): output resistance (default 50 ohm).
        Tau (param): output time constant, i.e. the delay (default 10 ns).
    """
    def __init__(self, p, n, out):
        self.Vd = signal('in', voltage, p, n)
        self.Vo = signal('in', voltage, out, '0')
        self.Io = signal('out', current, out, '0')

        self.Voh = param(5.0, 'V', 'High output level')
        self.Vol = param(0.0, 'V', 'Low output level')
        self.Vhys = param(0.0, 'V', 'Total hysteresis width')
        self.Vos = param(0.0, 'V', 'Input offset voltage')
        self.A = param(1.0e5, ' ', 'Gain of the transition region')
        self.Ro = param(50.0, 'Ω', 'Output resistance')
        self.Tau = param(10.0e-9, 's', 'Output time constant')
        self._high = None            # state: None = not decided yet
        self._tlast = 0.0

    def analog(self):
        vd = self.Vd + self.Vos
        half = 0.5 * self.Vhys
        vdv = ddt(self.Vo)           # keeps this element stateful (see Diac)
        if accepting():              # a time point has been accepted
            t = float(time)
            if t < self._tlast:      # a new run starts: forget the old state
                self._high = None
            self._tlast = t
            # The state flips w = Vh/A *before* the centre of the smooth
            # transition: a loop that is slowly dragged onto the threshold
            # (an RC oscillator) would otherwise settle inside the transition
            # region without ever flipping the state.
            w = 0.5 * (self.Voh - self.Vol) / self.A
            if self._high is None:
                self._high = vd >= 0.0
            elif self._high:
                if vd < -half + w:
                    self._high = False
            elif vd > half - w:
                self._high = True
            return
        high = self._high
        if high is None:             # before the first accepted point
            high = vd >= 0.0
        thr = -half if high else half
        vmid = 0.5 * (self.Voh + self.Vol)
        vh = 0.5 * (self.Voh - self.Vol)
        vtarget = vmid + vh * tanh(self.A * (vd - thr) / vh)
        self.Io += (self.Vo - vtarget) / self.Ro + (self.Tau / self.Ro) * vdv
