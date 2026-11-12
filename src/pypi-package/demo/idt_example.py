#-------------------------------------------------------------------------------
# Name:        idt() example: an inductor written with the integral
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# idt(x, ic) = ic + integral of x dt.   The inductor  v = L di/dt  can be
# written either with the derivative  (Inductor model: v = L ddt(i))  or with
# the integral  i = I0 + (1/L) integral v dt  :
#
#       self.I += idt(self.V, self.I0 * self.L) / self.L
#
# Both models are put in the same series RLC circuit and compared.

from pyams.lib import circuit, model, signal, param, idt
from pyams.lib import voltage, current
from pyams.models import SinVoltage, Resistor, Capacitor, Inductor


class InductorIdt(model):
    """Inductor written with idt():  i = I0 + (1/L) * integral(v dt)."""
    def __init__(self, p, n):
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        self.L = param(10e-3, 'H', 'Inductance')
        self.I0 = param(0.0, 'A', 'Initial current')

    def analog(self):
        self.I += idt(self.V, self.I0 * self.L) / self.L


def build(inductor_class):
    V = SinVoltage("s", "0");  V.setParams("Va=5V Fr=500Hz")
    R = Resistor("s", "a");    R.setParams("R=20Ω")
    L = inductor_class("a", "b"); L.setParams("L=10mH")
    C = Capacitor("b", "0");   C.setParams("C=10uF")
    cir = circuit()
    cir.addElements({"V": V, "R": R, "L": L, "C": C})
    cir.setOutPuts("b", "L.I")
    cir.analysis(mode="tran", start=0, stop=0.01, step=1e-5,
                 uic=True, adaptive=True, order=2)
    cir.run()
    return cir

c_ddt = build(Inductor)          # v = L ddt(i)
c_idt = build(InductorIdt)       # i = (1/L) idt(v)

import numpy as np
for name in ("b", "L.I"):
    d = np.max(np.abs(c_ddt.results[name] - c_idt.results[name]))
    print("%-4s  max difference ddt-inductor / idt-inductor: %.2e (peak %.3g)"
          % (name, d, np.max(np.abs(c_ddt.results[name]))))
c_idt.plot("idt_example_result.png", show=False)
