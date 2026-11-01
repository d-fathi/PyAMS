#-------------------------------------------------------------------------------
# Name:        Transmission line: pulse, reflections and the load resistance
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
# A 3.3 V pulse (Rs = 20 Ohm) drives a 50 Ohm line with a delay of 1 ns.
# The load resistance RL is swept with sweep(): matched (50 Ohm, no echo),
# high (200 Ohm, positive reflection) and open (1 MOhm, full reflection).
# The reflection coefficient at the load is  G_L = (RL - Z0) / (RL + Z0)  and
# at the source  G_S = (Rs - Z0) / (Rs + Z0) = -0.43, so the echoes bounce
# between the two ends every 2 ns (Td = 1 ns each way).

from pyams.lib import circuit
from pyams.models import (TrapezoidVoltage, Resistor, TransmissionLine)

Vs = TrapezoidVoltage("s", "0")
Vs.setParams("V0=0V V1=3.3V Td=0.5ns Tr=0.2ns Tw=6ns Tf=0.2ns T=40ns")
Rs = Resistor("s", "a");  Rs.setParams("R=20Ω")
TL = TransmissionLine("a", "b", "0", sections=30)
TL.setParams("Z0=50Ω Td=1ns")
RL = Resistor("b", "0");  RL.setParams("R=50Ω")

cir = circuit()
cir.addElements({"Vs": Vs, "Rs": Rs, "TL": TL, "RL": RL})
cir.setOutPuts("a", "b")                  # line input / line output
cir.analysis(mode="tran", start=0, stop=12e-9, step=2e-11,
             uic=True, adaptive=True, order=2)
cir.sweep(param="RL.R", list=[50, 200, 1e6])
results = cir.run()                       # one result per load resistance

import numpy as np
Z0, Rsrc, Vinc = 50.0, 20.0, 3.3 * 50 / 70
gs = (Rsrc - Z0) / (Rsrc + Z0)
for r in results:
    t = r["time"]
    ia = np.argmin(abs(t - 1.4e-9))       # input plateau before the echo (> 1.2 ns)
    ib = np.argmin(abs(t - 6.0e-9))       # after the 3rd arrival at the load
    gl = (r["param"] - Z0) / (r["param"] + Z0)
    # reflection (lattice) diagram: the 3rd arrival is at about 5.6 ns
    lattice = Vinc * (1 + gl) * sum((gl * gs) ** j for j in range(3))
    print("RL = %9.0f Ohm : Va(1.4 ns) = %.3f V (ideal %.3f) | "
          "Vb(6 ns) = %.3f V (lattice diagram %.3f)"
          % (r["param"], r["a"][ia], Vinc, r["b"][ib], lattice))
cir.plot("transmission_line_result.png", show=False)
