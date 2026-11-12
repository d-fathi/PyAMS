#-------------------------------------------------------------------------------
# Name:        Chua's circuit with op-amps (double-scroll chaotic oscillator)
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#            R           V2
#   V1 ──[ R ]────────────┬──────┐
#    │                    │      │
#  [C1]  [ Chua diode ]  [C2]   [L]
#    │         │          │      │
#   gnd       gnd        gnd   [R0]  (inductor series resistance)
#                                │
#                               gnd
#
#   C1 dV1/dt = (V2 - V1)/R - f(V1)
#   C2 dV2/dt = (V1 - V2)/R + iL
#   L  diL/dt = -V2 - R0·iL
#
# The Chua diode f(V) is a nonlinear resistor built from two op-amps.  Each
# op-amp is a non-inverting amplifier (gain K = 1 + Rf/Rg) whose (+) input is the
# diode node V1, and a resistor Rn joins V1 to the op-amp output:
#
#     inside the linear range    i = (V1 - K·V1)/Rn = -(K-1)/Rn · V1   (negative R)
#     when the output saturates  i = (V1 ∓ Vsat)/Rn                    (positive R)
#
# OA1 (K = 9)  saturates first, at |V1| = Vsat/9 = 1 V.
# OA2 (K = 2)  saturates later,  at |V1| = Vsat/2 = 4.5 V.  This gives the three
# slopes of Chua's diode:
#     |V1| < 1 V      : Ga = -0.762 mS
#     1 V < |V1| < 4.5 V : Gb = -0.416 mS
#     |V1| > 4.5 V    : Gc = +0.486 mS   (confines the orbit)
#
# The circuit is chaotic around R = 1.7 kΩ (try 1.6 kΩ ... 2 kΩ: it moves from
# a limit cycle through period doubling to chaos and the double scroll).  The
# oscillation is started by the 1 mV input offset of the op-amps (the origin is an
# unstable equilibrium); uic=True starts the circuit with all capacitors empty.


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, Inductor, OpAmp

# Chua's circuit
C1 = Capacitor("V1", "0")
C2 = Capacitor("V2", "0")
R = Resistor("V1", "V2")
L1 = Inductor("V2", "IL")
R0 = Resistor("IL", "0")                # series resistance of the inductor

# Chua diode, first op-amp (K = 9)
U1 = OpAmp("V1", "G1", "A1")            # (+, -, output)
Rf1 = Resistor("A1", "G1")
Rg1 = Resistor("G1", "0")
Ra = Resistor("V1", "A1")
# Chua diode, second op-amp (K = 2)
U2 = OpAmp("V1", "G2", "A2")
Rf2 = Resistor("A2", "G2")
Rg2 = Resistor("G2", "0")
Rb = Resistor("V1", "A2")

# Set element parameters
C1.setParams("C=10nF")
C2.setParams("C=100nF")
R.setParams("R=1.7KΩ")
L1.setParams("L=18mH")
R0.setParams("R=12.5Ω")
U1.setParams("Vcc=9V Vee=-9V Vos=1mV")
U2.setParams("Vcc=9V Vee=-9V Vos=1mV")
Rf1.setParams("R=8KΩ")
Rg1.setParams("R=1KΩ")
Ra.setParams("R=26KΩ")
Rf2.setParams("R=10KΩ")
Rg2.setParams("R=10KΩ")
Rb.setParams("R=2.2KΩ")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"C1": C1, "C2": C2, "R": R, "L1": L1, "R0": R0,
                     "U1": U1, "Rf1": Rf1, "Rg1": Rg1, "Ra": Ra,
                     "U2": U2, "Rf2": Rf2, "Rg2": Rg2, "Rb": Rb})

# Set output for plotting
circuit.setOutPuts("V1", "V2")

# Perform transient analysis
circuit.analysis(mode="tran", start=0, stop=0.02, step=1e-6,
                 adaptive=True, order=2, uic=True, progress=True)
circuit.run()
circuit.plot(filename="chua_result.png", show=False)


# ---- Double scroll: phase portrait V2 versus V1 -----------------------------------
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

t = np.asarray(circuit.results["time"])
v1 = np.asarray(circuit.results["V1"])
v2 = np.asarray(circuit.results["V2"])
keep = t > 2e-3                                   # skip the start-up transient

surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, ax = plt.subplots(figsize=(6.4, 5), facecolor=surface)
ax.set_facecolor(surface)
ax.plot(v1[keep], v2[keep], color='#2a78d6', linewidth=0.7)
ax.set_xlabel('V1 (V)', color=ink2)
ax.set_ylabel('V2 (V)', color=ink2)
ax.set_title("Chua's circuit: double scroll (V2 versus V1)", loc='left', color=ink, fontsize=12)
ax.grid(color=grid, linewidth=0.8); ax.set_axisbelow(True)
for side in ('top', 'right'):
    ax.spines[side].set_visible(False)
for side in ('left', 'bottom'):
    ax.spines[side].set_color(axis_c)
ax.tick_params(colors=ink2)
fig.tight_layout()
fig.savefig("chua_double_scroll.png", dpi=150, facecolor=surface)
