#-------------------------------------------------------------------------------
# Name:        Astable multivibrator (two NPN BJT transistors)
# Updated:     15/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#                    Vcc
#      ┌───────┬───────┼───────┬───────┐
#     Rc1     Rb1     Rb2     Rc2      │
#      │       │       │       │       │
#      ├──C1───┼───────┤       │       │    C1 : Out1 → B2
#      │       │       └───C2──┤       │    C2 : Out2 → B1
#    Out1     B1       B2    Out2
#      │  Q1 ──┘       └── Q2  │
#      └── c ─ e ─ gnd ─ e ─ c ┘
#
# Each transistor is switched on in turn; the base resistors recharge the
# coupling capacitors and set the period  T ≈ ln2 · (Rb1·C2 + Rb2·C1)
# (≈ 0.65 ms by this rule of thumb; the full model gives 0.678 ms because it
# includes Vbe and the saturation voltage).  The supply ramps up like a real
# power switch-on, and Rc2 is a little larger than Rc1 (component tolerance):
# a perfectly symmetric circuit stays at its unstable balance point and never
# starts (a real one is started by noise).
#
# The BJT model includes its junction capacitances (Cje, Cjc).  Without them a
# regenerative circuit like this one has no capacitance on some nodes and the
# equations jump when a transistor switches, so the solver cannot follow it.
#
# Time step: the edges of this circuit take nanoseconds while the base
# capacitors recharge over hundreds of microseconds, so a fixed step is either
# slow or wrong (step=1e-7 takes about 10 s; step=1e-6 is fast but the circuit
# starts about 0.1 ms late).  adaptive=True lets the solver choose its own step
# (tiny at the edges, tens of microseconds in between) and order=2 selects a
# second-order method; `step` is then only the spacing of the output points.
# The result agrees with a reference ODE solution to 0.07 us on every edge and
# 0.001 % on the period, in about 1.5 s.


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, BJT, TrapezoidVoltage

# Define elements
V1 = TrapezoidVoltage("Vcc", "0")      # 5 V supply, switched on at t = 0
Rc1 = Resistor("Vcc", "Out1")
Rc2 = Resistor("Vcc", "Out2")
Rb1 = Resistor("Vcc", "B1")
Rb2 = Resistor("Vcc", "B2")
C1 = Capacitor("Out1", "B2")
C2 = Capacitor("Out2", "B1")
Q1 = BJT("Out1", "B1", "0")            # (collector, base, emitter)
Q2 = BJT("Out2", "B2", "0")

# Set element parameters
V1.setParams("V0=0V V1=5V Td=0 Tr=20us Tw=10 Tf=1us T=20")
Rc1.setParams("R=1KΩ")
Rc2.setParams("R=1.1KΩ")
Rb1.setParams("R=47KΩ")
Rb2.setParams("R=47KΩ")
C1.setParams("C=10nF")
C2.setParams("C=10nF")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"V1": V1, "Rc1": Rc1, "Rc2": Rc2, "Rb1": Rb1, "Rb2": Rb2,
                     "C1": C1, "C2": C2, "Q1": Q1, "Q2": Q2})

# Set output for plotting
circuit.setOutPuts("Out1", "Out2", "B1", "B2")

# Perform transient analysis (about 7 periods)
circuit.analysis(mode="tran", start=0, stop=0.005, step=1e-7,
                 adaptive=True, order=2, lte=1e-4, progress=True)
circuit.run()
circuit.plot()
