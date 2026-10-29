#-------------------------------------------------------------------------------
# Name:        Nonlinear resistance (Van der Pol)
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import signal, param, model
from pyams.lib import voltage, current


class NonlinearResistance(model):
    """
    Voltage-controlled nonlinear (cubic) resistance used in the Van der Pol
    oscillator.  Its differential conductance is

        1/R(v) = dI/dV = Mu (v^2 - 1)

    i.e. negative for |v| < 1 (it injects energy) and positive for |v| > 1
    (it dissipates energy).  Integrating gives the current

        I(v) = Mu (v^3 / 3 - v)

    Connected in parallel with a capacitor C and an inductor L the node voltage
    obeys   C v'' + Mu (v^2 - 1) v' + v / L = 0   (Van der Pol equation).

    Terminals: NonlinearResistance(p, n)   current flows p -> n.
    Parameters:
        Mu   nonlinearity / damping coefficient (S)      (1)
    """
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        self.Mu = param(1.0, 'S', 'Nonlinearity coefficient')

    def analog(self):
        v = self.V
        self.I += self.Mu * (v * v * v / 3.0 - v)
