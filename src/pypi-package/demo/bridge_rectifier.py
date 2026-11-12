#-------------------------------------------------------------------------------
# Name:        Full-wave bridge rectifier fed by a transformer
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#                  T1 (2:1 step-down)                D1        Out
#   V1 ──[Rp]── P1 ═╗╔═ A ────────┬───────┬───────►|────────┬────────┐
#   50 Hz           ║║            │       └───────►|─┐ D2    │        │
#   20 V peak       ║║            D3                 │       C1      R1
#                gnd═╝╚═ B ─┐     ▼                  │      (filter) (load)
#                           └─────D4──────────────────┘       │        │
#                                  └────────── gnd ───────────┴────────┘
#
# Bridge: D1 A→Out, D2 B→Out, D3 gnd→A, D4 gnd→B.  On each half-cycle two
# diodes conduct, so the load sees |V(A) - V(B)| minus two diode drops, and
# C1 smooths it (ripple ≈ I/(2*f*C)).
# The transformer has L1 = 100 mH, L2 = 25 mH, M = 49.5 mH (k = 0.99), so the
# turns ratio is sqrt(25/100) = 1/2 and the secondary peak is about 10 V.


from pyams.lib import circuit
from pyams.models import (Resistor, Capacitor, SinVoltage, Transformer, Diode)

# Define elements
V1 = SinVoltage("In", "0")
Rp = Resistor("In", "P1")              # primary winding resistance
T1 = Transformer("P1", "0", "A", "B")  # (p1, n1, p2, n2)
D1 = Diode("A", "Out")
D2 = Diode("B", "Out")
D3 = Diode("0", "A")
D4 = Diode("0", "B")
C1 = Capacitor("Out", "0")
R1 = Resistor("Out", "0")

# Set element parameters
V1.setParams("Va=20V Fr=50Hz")
Rp.setParams("R=5Ω")
T1.setParams("L1=100mH L2=25mH M=49.5mH")
C1.setParams("C=470uF")
R1.setParams("R=1KΩ")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"V1": V1, "Rp": Rp, "T1": T1, "D1": D1, "D2": D2,
                     "D3": D3, "D4": D4, "C1": C1, "R1": R1})

# Set output for plotting
circuit.setOutPuts("In", "A", "B", "Out")

# Perform transient analysis (5 periods)
circuit.analysis(mode="tran", start=0, stop=0.1, step=1e-4,
                 adaptive=True, order=2, progress=True)
circuit.run()
circuit.plot(filename="bridge_rectifier_result.png", show=False)
