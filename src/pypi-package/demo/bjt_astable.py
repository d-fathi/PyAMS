# BJT astable multivibrator (classic two-transistor circuit)
#   Vcc = 5 V, collector resistors 2k, base resistors 100k (to Vcc), coupling capacitors 10 nF
#   period ~ 1.386 * R * C = 1.39 ms
import numpy as np
from pyams.lib import circuit
from pyams.models import DCVoltage, Resistor, Capacitor, BJT

V1 = DCVoltage("N03", "0")
R1 = Resistor("N03", "out1")      # collector resistor of Q2
R2 = Resistor("N03", "out2")      # collector resistor of Q1
R3 = Resistor("N03", "N04")       # base resistor of Q2 (to Vcc)
R4 = Resistor("N03", "N05")       # base resistor of Q1 (to Vcc)
C1 = Capacitor("N04", "out2")     # couples collector of Q1 -> base of Q2
C2 = Capacitor("out1", "N05")     # couples collector of Q2 -> base of Q1
Q1 = BJT("out2", "N05", "0")      # (collector, base, emitter)
Q2 = BJT("out1", "N04", "0")

V1.setParams("Vdc=5V")
R1.setParams("R=2KΩ")
R2.setParams("R=2KΩ")
R3.setParams("R=100KΩ")
R4.setParams("R=100KΩ")
C1.setParams("C=0.01uF")
C2.setParams("C=0.01uF")

cir = circuit()
cir.addElements({"V1": V1, "R1": R1, "R2": R2, "R3": R3, "R4": R4,
                 "C1": C1, "C2": C2, "Q1": Q1, "Q2": Q2})
cir.setOutPuts("out1", "out2", "N04", "N05")

# uic=True: start from the zero state (otherwise the symmetric operating point
# is an unstable equilibrium and the oscillation never starts)
cir.analysis(mode="tran", start=0, stop=10e-3, step=2e-6,
             adaptive=True, order=2, max_step=5e-6, uic=True)
res = cir.run()

t, v = np.array(res["time"]), np.array(res["out1"])
up = t[1:][(v[:-1] < 2.5) & (v[1:] >= 2.5)]
if len(up) > 1:
    T = np.diff(up).mean()
    print("period = %.3f ms  (%.1f Hz);  theory 1.386 R C = %.3f ms" % (T * 1e3, 1 / T, 1.386 * 100e3 * 10e-9 * 1e3))
cir.plot("bjt_astable.png", show=False)
