#-------------------------------------------------------------------------------
# Name:        Ring oscillator (3 CMOS inverters with RC delay)
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#          ┌───────────────────────────────────────────────────────────┐
#          │      INV1            R1        INV2            R2     INV3│ R3
#          └─ g1 ─►o──── o1 ──[R1]── g2 ─►o──── o2 ──[R2]── g3 ─►o─ o3 ─[R3]─┐
#             │                     │                    │                   │
#            C1                    C2                   C3                   │
#             │                     │                    │                   │
#            gnd                   gnd                  gnd      (back to g1)┘
#
# Each inverter is a CMOS pair: a P-channel MOSFET from Vdd to the output and an
# N-channel MOSFET from the output to ground, gates tied together.  The output
# of an inverter reaches the next gate through a resistor R, and the capacitor
# C at that gate sets the delay of the stage (the RC network of each stage).
# An odd number of inverting stages has no stable state, so the loop oscillates:
#
#     one half period = the signal travels once round the ring
#     f ≈ 1 / (2 · N · td),   td ≈ the delay of one stage  (≈ 0.7 · R · C)
#
# The three capacitors differ by 2 % (like real components); a perfectly
# symmetric ring would stay at its unstable balance point, and the supply
# switch-on (uic=True: all nodes start at 0 V) would move the three nodes
# together.


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, DCVoltage, MOSFET

# Supply
Vdd = DCVoltage("Vdd", "0")

# Stage 1: inverter (gate g1, output o1), then R1 and C1 to the next gate g2
P1 = MOSFET("o1", "g1", "Vdd")         # (drain, gate, source)
N1 = MOSFET("o1", "g1", "0")
R1 = Resistor("o1", "g2")
C1 = Capacitor("g2", "0")
# Stage 2
P2 = MOSFET("o2", "g2", "Vdd")
N2 = MOSFET("o2", "g2", "0")
R2 = Resistor("o2", "g3")
C2 = Capacitor("g3", "0")
# Stage 3: closes the loop onto g1
P3 = MOSFET("o3", "g3", "Vdd")
N3 = MOSFET("o3", "g3", "0")
R3 = Resistor("o3", "g1")
C3 = Capacitor("g1", "0")

# Set element parameters
Vdd.setParams("Vdc=5V")
for n in (N1, N2, N3):
    n.setParams("Type=1 Kp=100u W=10u L=1u Vth=1 Lambda=0.02")
for p in (P1, P2, P3):                  # same strength as the N device (Kp/2.5, W*2.5)
    p.setParams("Type=-1 Kp=40u W=25u L=1u Vth=1 Lambda=0.02")
R1.setParams("R=10KΩ")
R2.setParams("R=10KΩ")
R3.setParams("R=10KΩ")
C1.setParams("C=1nF")
C2.setParams("C=1.02nF")
C3.setParams("C=1.04nF")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"Vdd": Vdd, "P1": P1, "N1": N1, "R1": R1, "C1": C1,
                     "P2": P2, "N2": N2, "R2": R2, "C2": C2,
                     "P3": P3, "N3": N3, "R3": R3, "C3": C3})

# Set output for plotting
circuit.setOutPuts("o1", "o2", "o3")

# Perform transient analysis
circuit.analysis(mode="tran", start=0, stop=0.0005, step=1e-7,
                 adaptive=True, order=2, uic=True, progress=True)
circuit.run()
circuit.plot(filename="ring_oscillator_result.png", show=False)
