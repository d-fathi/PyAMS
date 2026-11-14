#-------------------------------------------------------------------------------
# Name:        Schmitt trigger with two BJT transistors (emitter coupled)
# Author:      d.fathi
# Created:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
#
#                 Vcc (12 V)
#        ┌──────────┬──────────┐
#       Rc1        Rc2          │
#        │          │           │
#        ├──[R1]──┬─┼───── Out  │       Vin ──[Rs]── In ──► Q1 base
#        C1       │ │           │
#        │       B2 │           │       Q1: c = C1, b = In, e = E
#   In ──┤Q1      │ Q2          │       Q2: c = Out, b = B2, e = E
#        │       [R2]           │
#        E ───────┼─────E───────┘       R1, R2 : feedback divider C1 → B2 → gnd
#        │                              Re      : common emitter resistor
#       [Re]
#        │
#       gnd
#
# Low input: Q1 is off, Q2 is on (Out low).  When Vin rises above the upper
# threshold Q1 starts to conduct, its collector falls, Q2 turns off and Out
# jumps high.  The common emitter resistor makes the thresholds different when
# rising (UTP) and falling (LTP): the hysteresis.  The input is a 100 Hz sine,
# 0 .. 5 V.


from pyams.lib import circuit
from pyams.models import Resistor, SinVoltage, DCVoltage, BJT

# Define elements
Vcc = DCVoltage("Vcc", "0")
Vin = SinVoltage("Vs", "0")
Rs = Resistor("Vs", "In")
Rc1 = Resistor("Vcc", "C1")
Rc2 = Resistor("Vcc", "Out")
R1 = Resistor("C1", "B2")
R2 = Resistor("B2", "0")
Re = Resistor("E", "0")
Q1 = BJT("C1", "In", "E")              # (collector, base, emitter)
Q2 = BJT("Out", "B2", "E")

# Set element parameters
Vcc.setParams("Vdc=12V")
Vin.setParams("Va=2.5V Voff=2.5V Fr=100Hz Ph=-90")   # starts at 0 V
Rs.setParams("R=1KΩ")
Rc1.setParams("R=2.2KΩ")
Rc2.setParams("R=1KΩ")
R1.setParams("R=2.2KΩ")
R2.setParams("R=3.3KΩ")
Re.setParams("R=470Ω")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"Vcc": Vcc, "Vin": Vin, "Rs": Rs, "Rc1": Rc1, "Rc2": Rc2,
                     "R1": R1, "R2": R2, "Re": Re, "Q1": Q1, "Q2": Q2})

# Set output for plotting
circuit.setOutPuts("Vs", "Out")

# Perform transient analysis (3 periods)
circuit.analysis(mode="tran", start=0, stop=0.03, step=1e-5,
                 adaptive=True, order=2, progress=True)
circuit.run()
circuit.plot(filename="schmitt_bjt_result.png", show=False)


# ---- Input / output relation (transfer characteristic) ---------------------------
# Out plotted against the input source Vs: the hysteresis loop.  (The base node
# 'In' is not used: it is pulled down by the base current through Rs when Q1
# conducts, which would bend the loop.)  The sine is slow compared with
# the circuit, so the loop is the static characteristic.
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

vin = np.asarray(circuit.results["Vs"])
vout = np.asarray(circuit.results["Out"])
mid = 0.5 * (vout.max() + vout.min())
hi = vout > mid
sw = np.where(hi[1:] != hi[:-1])[0]             # switching instants
utp = np.mean([vin[k] for k in sw if hi[k + 1]])     # rising  -> Out goes high
ltp = np.mean([vin[k] for k in sw if not hi[k + 1]]) # falling -> Out goes low

surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, ax = plt.subplots(figsize=(7, 4.6), facecolor=surface)
ax.set_facecolor(surface)
ax.plot(vin, vout, color='#2a78d6', linewidth=2)
ax.set_xlabel('Input voltage Vs (V)', color=ink2)
ax.set_ylabel('Output voltage Out (V)', color=ink2)
ax.set_title('Schmitt trigger: Out versus Vs (input source)', loc='left', color=ink, fontsize=12)
ax.grid(color=grid, linewidth=0.8); ax.set_axisbelow(True)
for side in ('top', 'right'):
    ax.spines[side].set_visible(False)
for side in ('left', 'bottom'):
    ax.spines[side].set_color(axis_c)
ax.tick_params(colors=ink2)
lo_v, hi_v = vout.min(), vout.max()
for x, lab, ha in ((ltp, 'LTP = %.2f V' % ltp, 'right'), (utp, 'UTP = %.2f V' % utp, 'left')):
    ax.axvline(x, color='#898781', linestyle='--', linewidth=1)
    ax.text(x + (0.06 if ha == 'left' else -0.06), 0.5 * (lo_v + hi_v), lab,
            ha=ha, va='center', color=ink2, fontsize=10)
# direction of travel
ax.annotate('', xy=(utp - 0.5, lo_v), xytext=(utp - 1.5, lo_v),
            arrowprops=dict(arrowstyle='->', color=ink2))
ax.annotate('', xy=(ltp + 0.5, hi_v), xytext=(ltp + 1.5, hi_v),
            arrowprops=dict(arrowstyle='->', color=ink2))
fig.tight_layout()
fig.savefig("schmitt_bjt_transfer.png", dpi=150, facecolor=surface)
print("UTP = %.3f V, LTP = %.3f V, hysteresis = %.3f V, Out low/high = %.2f / %.2f V"
      % (utp, ltp, utp - ltp, lo_v, hi_v))
