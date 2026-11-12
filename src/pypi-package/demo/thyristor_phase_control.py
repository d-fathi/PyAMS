#-------------------------------------------------------------------------------
# Name:        Thyristor phase control (half-wave, resistive load)
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# A 220 V / 50 Hz mains (311 V peak) feeds a 50 Ohm load through an SCR.  A
# 200 us gate pulse (5 V through 100 Ohm) fires the SCR at the angle alpha of
# the positive half-cycle; the SCR then conducts until the current falls
# below the holding current at the end of the half-cycle (natural
# commutation).  The delay of the gate pulse is swept with sweep(), i.e. the
# firing angle is 30, 90 and 150 degrees, and the average load voltage is
# compared with the textbook formula  Vavg = Vm (1 + cos alpha) / (2 pi)
# (and with a numerical reference that includes the on-state drop Von, Ron).

import numpy as np
from pyams.lib import circuit
from pyams.models import SinVoltage, TrapezoidVoltage, Resistor, Thyristor

f, Vm, RLoad = 50.0, 311.0, 50.0
angles = [30.0, 90.0, 150.0]                       # firing angles (degrees)
delays = [a / 360.0 / f for a in angles]            # gate pulse delay (s)

Vs = SinVoltage("a", "0");   Vs.setParams("Va=%gV Fr=%gHz" % (Vm, f))
T1 = Thyristor("a", "g", "k")
RL = Resistor("k", "0");     RL.setParams("R=%gΩ" % RLoad)
# gate drive: a pulse source between the gate-drive node and the cathode
Vg = TrapezoidVoltage("gd", "k")
Vg.setParams("V0=0V V1=5V Td=1ms Tr=1us Tw=200us Tf=1us T=20ms")
Rg = Resistor("gd", "g");    Rg.setParams("R=100Ω")

cir = circuit()
cir.addElements({"Vs": Vs, "T1": T1, "RL": RL, "Vg": Vg, "Rg": Rg})
cir.setOutPuts("a", "k")
cir.analysis(mode="tran", start=0, stop=0.04, step=2e-5,
             adaptive=True, order=2, max_step=5e-5)
cir.sweep(param="Vg.Td", list=delays)
results = cir.run()

trapz = getattr(np, "trapezoid", None) or np.trapz

def reference(ang):
    """Average load voltage of the SCR conducting from alpha until the current
    falls below the holding current (Von and Ron included), on a fine grid."""
    p = T1.getParams()
    t = np.linspace(0.02, 0.04, 200001)
    vs = Vm * np.sin(2 * np.pi * f * t)
    t_fire = 0.02 + ang / 360.0 / f
    i = (vs - p["Von"]) / (RLoad + p["Ron"])
    on = (t >= t_fire) & (i >= p["Ih"]) & (vs > 0)
    # once the current falls below Ih the SCR stays off until the next trigger
    stop = np.argmax((t > t_fire) & (i < p["Ih"]))
    on &= np.arange(len(t)) < stop
    vload = np.where(on, i * RLoad, 0.0)
    return trapz(vload, t) / (t[-1] - t[0])

for ang, r in zip(angles, results):
    t, vk = r["time"], r["k"]
    p = (t >= 0.02) & (t < 0.04)                    # the second full cycle
    v_sim = trapz(vk[p], t[p]) / (t[p][-1] - t[p][0])
    print("alpha = %5.1f deg : average load voltage %.2f V | reference "
          "%.2f V | ideal SCR formula %.2f V"
          % (ang, v_sim, reference(ang),
             Vm * (1 + np.cos(np.radians(ang))) / (2 * np.pi)))
cir.plot("thyristor_phase_control.png", show=False)
