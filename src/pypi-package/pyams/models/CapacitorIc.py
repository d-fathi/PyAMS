#-------------------------------------------------------------------------------
# Name:        Capacitor with initial voltage
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import signal, param, model
from pyams.lib import voltage, current
from pyams.lib import idt


class CapacitorIc(model):
    """
    Capacitor with an initial voltage (SPICE ``C ... IC=``).

        V(t) = Ic + (1/C) integral(I dt)          (I flows p -> n)

    The capacitor is written in integral form: in the operating point at the
    start of a transient the integral is zero, so the capacitor is held at V = Ic
    (like ``.ic``/UIC in SPICE) and then evolves freely.  Use it together with
    InductorIc and a normal transient analysis (do not use ``uic=True``).

    Terminals: CapacitorIc(p, n)
    Parameters:
        C    capacitance (F)           (1 uF)
        Ic   initial voltage V(p)-V(n) (V)   (0)
    """
    def __init__(self, p, n):
        self.I = signal('in', current, p, n)
        self.V = signal('out', voltage, p, n)
        self.C = param(1.0e-6, 'F', 'Capacitance')
        self.Ic = param(0.0, 'V', 'Initial voltage')

    def analog(self):
        self.V += idt(self.I / self.C, self.Ic)
