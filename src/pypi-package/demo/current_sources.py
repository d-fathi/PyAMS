#-------------------------------------------------------------------------------
# Name:        Current sources: DCCurrent, SinCurrent, TrapezoidCurrent
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
# Each source feeds a parallel R || C (R = 1 kOhm, C = 1 uF, tau = 1 ms).
# A positive current flows through the source from p ("0") to n, so it is
# pushed into the RC node:   C dv/dt + v/R = i(t).
#   DC        : v = Idc R (1 - exp(-t/tau))
#   Sine      : low-pass filter of the current, |Z| = R / sqrt(1 + (w tau)^2)
#   Trapezoid : the voltage follows the integral of the current pulse.

from pyams.lib import circuit
from pyams.models import (Resistor, Capacitor, DCCurrent, SinCurrent,
                          TrapezoidCurrent)

# DC current source -----------------------------------------------------------
Idc = DCCurrent("0", "Vdc");     Idc.setParams("Idc=1mA")
R1 = Resistor("Vdc", "0");       R1.setParams("R=1KΩ")
C1 = Capacitor("Vdc", "0");      C1.setParams("C=1uF")

# Sinusoidal current source ---------------------------------------------------
Isin = SinCurrent("0", "Vsin");  Isin.setParams("Ia=1mA Fr=200Hz")
R2 = Resistor("Vsin", "0");      R2.setParams("R=1KΩ")
C2 = Capacitor("Vsin", "0");     C2.setParams("C=1uF")

# Trapezoidal current source --------------------------------------------------
Itrap = TrapezoidCurrent("0", "Vtrap")
Itrap.setParams("I0=0A I1=1mA Td=1ms Tr=0.5ms Tw=2ms Tf=0.5ms T=6ms")
R3 = Resistor("Vtrap", "0");     R3.setParams("R=1KΩ")
C3 = Capacitor("Vtrap", "0");    C3.setParams("C=1uF")

cir = circuit()
cir.addElements({"Idc": Idc, "R1": R1, "C1": C1,
                 "Isin": Isin, "R2": R2, "C2": C2,
                 "Itrap": Itrap, "R3": R3, "C3": C3})
cir.setOutPuts("Vdc", "Vsin", "Vtrap", "Idc.I", "Isin.I", "Itrap.I")
# uic: the switch-on starts with uncharged capacitors
cir.analysis(mode="tran", start=0, stop=0.012, step=2e-5, uic=True,
             adaptive=True, order=2)
cir.run()
cir.plot("current_sources_result.png", show=False)
