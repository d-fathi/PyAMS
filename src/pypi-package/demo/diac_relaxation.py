#-------------------------------------------------------------------------------
# Name:        Diac relaxation oscillator
# Author:      d.fathi
# Created:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
#
#   V1 (60 V) ──[ R1 100k ]──┬───────┬─── Out1
#                            │       │
#                          [ C1 ]  [ X1 diac ]
#                          22 nF    │
#                            │      ├─── Out2
#                           gnd   [ R2 10 Ω ]
#                                   │
#                                  gnd
#
# C1 charges through R1 towards 60 V.  When Out1 reaches the breakover voltage
# of the diac (36 V) the diac switches on and C1 discharges through it and R2
# (a short current pulse, seen across R2 as Out2) until the current falls below
# the holding current and the diac turns off again (Out1 ≈ 16 V).  Then C1
# charges again:
#
#     first peak : t = R1·C1·ln(60 / (60 - 36))        ≈ 2.0 ms
#     period     : T = R1·C1·ln((60 - 16) / (60 - 36)) ≈ 1.33 ms (a bit more
#                  because of the diac leakage current)


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, DCVoltage, Diac

# Define elements
V1 = DCVoltage("In", "0")
R1 = Resistor("In", "Out1")
C1 = Capacitor("Out1", "0")
X1 = Diac("Out1", "Out2")
R2 = Resistor("Out2", "0")

# Set element parameters
V1.setParams("Vdc=60V")
R1.setParams("R=100KΩ")
C1.setParams("C=22nF")
R2.setParams("R=10Ω")
X1.setParams("Vbo=36V Vh=16V Ih=1mA Ron=34Ω Roff=4MΩ")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"V1": V1, "R1": R1, "C1": C1, "X1": X1, "R2": R2})

# Set output for plotting
circuit.setOutPuts("Out1", "Out2")

# Perform transient analysis (the capacitor starts empty: uic=True)
circuit.analysis(mode="tran", start=0, stop=0.008, step=1e-7,
                 adaptive=True, order=2, uic=True, progress=True)
circuit.run()
circuit.plot(filename="diac_relaxation_result.png", show=False)
