#-------------------------------------------------------------------------------
# Name:        Timer555 (NE555 timer, behavioural model)
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt, accepting, time

_counter = [0]          # every timer gets its own internal divider node


# Timer555 Model ----------------------------------------------------------------
class Timer555(model):
    """
    555 timer.  Terminals (the same order as the data sheet functions):

        Timer555(trig, thres, ctrl, reset, disch, out, vcc, gnd)

                      vcc
                       |
                      5k
                       |------ ctrl   (2/3 Vcc, upper reference)
                      5k
                       |------ m      (1/3 Vcc, lower reference)
                      5k
                       |
                      gnd

        thres  > V(ctrl)  : upper comparator   -> flip-flop RESET (output low)
        trig   < V(m)     : lower comparator   -> flip-flop SET   (output high)
        reset  < 0.7 V    : forces the output low (has priority)
        Q = 1 : out = Vcc - Vdrop, discharge transistor OFF
        Q = 0 : out = Vol,         discharge transistor ON (disch -> gnd, Rdis)

    The three internal 5 k resistors are real, so a voltage forced on the ctrl
    pin moves both thresholds (V(ctrl) and V(ctrl)/2), exactly as in the chip.
    The comparator inputs draw no current.  The flip-flop state changes only
    when a time point is accepted (see ``accepting()``, like the Comparator and
    the Thyristor), so the timing error is at most one time step: use a step
    well below the period/pulse width.

    Output: Thevenin source  (Vo - Vtarget)/Rout + Cout dVo/dt , with
    Vtarget = Vcc - Vdrop (high) or Vol (low).  The supply current is the
    divider current only (the output stage current is not drawn from vcc).

    Parameters:
        Rdiv (ohm)   each of the three divider resistors (5 k)
        Vdrop (V)    output high drop below Vcc (1.5 V)
        Vol (V)      output low level (0.1 V)
        Rout (ohm)   output resistance (20)
        Cout (F)     output capacitance, sets the edge time Rout*Cout (100 pF -> 2 ns)
        Rdis (ohm)   discharge transistor on resistance (10), Roff when off (1e10)
        Vrst (V)     reset threshold (0.7)
    """
    def __init__(self, trig, thres, ctrl, reset, disch, out, vcc, gnd):
        _counter[0] += 1
        m = '_t555%d_m' % _counter[0]                   # lower reference node
        self.Vtr = signal('in', voltage, trig, gnd)
        self.Vth = signal('in', voltage, thres, gnd)
        self.Vrs = signal('in', voltage, reset, gnd)
        self.Vcc = signal('in', voltage, vcc, gnd)
        self.Vct = signal('in', voltage, ctrl, gnd)
        self.Vm = signal('in', voltage, m, gnd)
        self.Vdv1 = signal('in', voltage, vcc, ctrl)    # divider
        self.Idv1 = signal('out', current, vcc, ctrl)
        self.Vdv2 = signal('in', voltage, ctrl, m)
        self.Idv2 = signal('out', current, ctrl, m)
        self.Vdv3 = signal('in', voltage, m, gnd)
        self.Idv3 = signal('out', current, m, gnd)
        self.Vdis = signal('in', voltage, disch, gnd)   # discharge transistor
        self.Idis = signal('out', current, disch, gnd)
        self.Vo = signal('in', voltage, out, gnd)       # output
        self.Io = signal('out', current, out, gnd)

        self.Rdiv = param(5.0e3, 'Ω', 'Divider resistor')
        self.Vdrop = param(1.5, 'V', 'Output high drop below Vcc')
        self.Vol = param(0.1, 'V', 'Output low level')
        self.Rout = param(20.0, 'Ω', 'Output resistance')
        self.Cout = param(100.0e-12, 'F', 'Output capacitance')
        self.Rdis = param(10.0, 'Ω', 'Discharge transistor on resistance')
        self.Roff = param(1.0e10, 'Ω', 'Discharge transistor off resistance')
        self.Vrst = param(0.7, 'V', 'Reset threshold')
        self._q = None               # flip-flop state, None = not decided yet
        self._tlast = 0.0

    def analog(self):
        dv = ddt(self.Vo)
        if accepting():              # a time point has been accepted
            t = float(time)
            if t < self._tlast:      # a new run starts
                self._q = None
            self._tlast = t
            q = self._q
            if q is None:
                q = False
            if self.Vrs < self.Vrst:
                q = False
            elif self.Vtr < self.Vm:
                q = True
            elif self.Vth > self.Vct:
                q = False
            self._q = q
            return
        q = bool(self._q)
        self.Idv1 += self.Vdv1 / self.Rdiv
        self.Idv2 += self.Vdv2 / self.Rdiv
        self.Idv3 += self.Vdv3 / self.Rdiv
        self.Idis += self.Vdis / (self.Roff if q else self.Rdis)
        vtarget = self.Vcc - self.Vdrop if q else self.Vol
        self.Io += (self.Vo - vtarget) / self.Rout + self.Cout * dv
