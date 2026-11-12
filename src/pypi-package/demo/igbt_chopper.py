#-------------------------------------------------------------------------------
# Name:        IGBT chopper (low-side switch, inductive load, freewheel diode)
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# A 100 V bus feeds an R-L load (5 Ohm, 0.5 mH) through an IGBT that is
# switched at 20 kHz, duty cycle ~50 %, by a 15 V gate driver (Rg = 10 Ohm).
# The diode in anti-parallel with the load carries the load current while the
# IGBT is off.  What to look for:
#   * Vce(on) of a few volts while the IGBT conducts (diode drop + channel),
#   * the collector current follows the load current (ripple around ~9 A),
#   * at turn-off Vce jumps to Vbus + Vf (diode clamps) and the collector
#     current does not drop to zero at once: the "tail current" of the stored
#     base charge (Tau).

from pyams.lib import circuit
from pyams.models import (DCVoltage, TrapezoidVoltage, Resistor, Inductor,
                          Diode, IGBT)

Vbus = DCVoltage("Vbus", "0");   Vbus.setParams("Vdc=100V")
Vdrv = TrapezoidVoltage("drv", "0")
Vdrv.setParams("V0=0V V1=15V Td=1us Tr=100ns Tw=24.8us Tf=100ns T=50us")
Rg = Resistor("drv", "G");       Rg.setParams("R=10Ω")
Rl = Resistor("Vbus", "m");      Rl.setParams("R=5Ω")
Ll = Inductor("m", "sw");        Ll.setParams("L=0.5mH")
Dfw = Diode("sw", "Vbus")        # freewheel diode (anode on the switch node)
Q1 = IGBT("sw", "G", "0")
Q1.setParams("Kp=0.1 Vth=5V Alpha=0.5 Tau=1us")

cir = circuit()
cir.addElements({"Vbus": Vbus, "Vdrv": Vdrv, "Rg": Rg, "Rl": Rl, "Ll": Ll,
                 "Dfw": Dfw, "Q1": Q1})
cir.setOutPuts("G", "sw", "Q1.Id", "Ll.I")
cir.analysis(mode="tran", start=0, stop=600e-6, step=2e-8,
             adaptive=True, order=2, uic=True)
r = cir.run()

import numpy as np
t = r["time"]
last = t >= 550e-6                        # the last period (settled)
on = last & (r["G"] > 14.0)
print("average load current (last period): %.2f A" % np.mean(r["Ll.I"][last]))
print("collector current  : peak %.2f A, Vce(on) at the end of the on-time = %.2f V"
      % (r["Q1.Id"][last].max(), r["sw"][on][-1]))
print("Vce(off) peak (bus + diode drop): %.1f V" % r["sw"][last].max())
cir.plot("igbt_chopper_result.png", show=False)
