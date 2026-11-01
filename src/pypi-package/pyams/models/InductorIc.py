#-------------------------------------------------------------------------------
# Name:        Inductor with initial current
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import signal, param, model
from pyams.lib import voltage, current
from pyams.lib import idt


class InductorIc(model):
    """
    Inductor with an initial current (SPICE ``L ... IC=``).

        I(t) = Ic + (1/L) integral(V dt)          (I flows p -> n)

    Written in integral form, so at the start of the transient (operating
    point) the inductor carries exactly Ic and then evolves freely.  Use it
    with a normal transient analysis (not ``uic=True``).

    Terminals: InductorIc(p, n)
    Parameters:
        L    inductance (H)            (1 mH)
        Ic   initial current p -> n (A)    (0)
    """
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        self.L = param(1.0e-3, 'H', 'Inductance')
        self.Ic = param(0.0, 'A', 'Initial current')

    def analog(self):
        self.I += idt(self.V / self.L, self.Ic)
