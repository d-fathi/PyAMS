#-------------------------------------------------------------------------------
# Name:        Thyristor characteristics I(V)
# Author:      d.fathi
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# A DC source with a 10 Ohm series resistor is swept from -50 V up to 200 V and
# back (analysis(mode="dc", param=...)); the thyristor current is plotted
# against its own voltage Vak.
#   * Ig = 0   : the SCR blocks (leakage) until the forward breakover voltage
#                Vbo = 100 V, then jumps to the on-state; on the way back it
#                stays on until the current falls below the holding current Ih.
#   * Ig = 8 mA (above Igt): it turns on at once, with no breakover.
# The gate current is changed with sweep() (gate source 0 V / 3 V via 300 Ohm).
# The on-state is  Vak = Von + Ron * I.

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DCVoltage, Resistor, Thyristor

Vs = DCVoltage("s", "0")
Rs = Resistor("s", "a");      Rs.setParams("R=10Ω")
T1 = Thyristor("a", "g", "0")
T1.setParams("Von=1V Ron=0.05Ω Roff=10MΩ Igt=2mA Ih=10mA Vbo=100V")
Vgd = DCVoltage("gd", "0");   Vgd.setParams("Vdc=0V")
Rg = Resistor("gd", "g");     Rg.setParams("R=300Ω")

cir = circuit()
cir.addElements({"Vs": Vs, "Rs": Rs, "T1": T1, "Vgd": Vgd, "Rg": Rg})
cir.setOutPuts("T1.V", "T1.I")
gate_volts = [0.0, 3.0]                       # Ig = 0 and Ig = (3 - 0.58)/300 = 8 mA

cir.analysis(mode="dc", param="Vs.Vdc", start=-50, stop=200, step=0.1)
cir.sweep(param="Vgd.Vdc", list=gate_volts)
up = cir.run()                                 # list: one result per gate voltage
cir.analysis(mode="dc", param="Vs.Vdc", start=200, stop=-50, step=-0.1)
down = cir.run()                               # the latch state is kept -> hysteresis

# ---- numbers ---------------------------------------------------------------
u, d = up[0], down[0]
vbo_i = np.argmax(u["T1.I"] > 1e-3)
print("Ig = 0 : breakover at Vak = %.1f V (Vbo = 100 V), then on-state jump to "
      "%.2f V at %.1f A" % (u["T1.V"][vbo_i - 1], u["T1.V"][vbo_i + 1], u["T1.I"][vbo_i + 1]))
off_i = np.argmax(d["T1.I"] < 1e-3)
print("         on the way back it switches off when I falls below Ih: last on-state "
      "current %.1f mA (Ih = 10 mA)" % (d["T1.I"][off_i - 1] * 1e3))
print("         off-state leakage at +90 V: %.2f uA, reverse leakage at -50 V: %.2f uA"
      % (1e6 * u["T1.I"][np.argmin(abs(u["T1.V"] - 90))],
         1e6 * u["T1.I"][0]))
g = up[1]
print("Ig = 8 mA: on-state from the start, Vak = %.3f V at %.2f A "
      "(Von + Ron I = %.3f V)" % (g["T1.V"][-1], g["T1.I"][-1],
                                  1.0 + 0.05 * g["T1.I"][-1]))

# ---- figure ------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
blue, orange, green = '#2a78d6', '#eb6834', '#1baf7a'
fig, axes = plt.subplots(1, 3, figsize=(14, 4.4), facecolor=surface)
def style(ax, title, xl, yl):
    ax.set_facecolor(surface)
    ax.set_title(title, loc='left', color=ink, fontsize=11)
    ax.set_xlabel(xl, color=ink2); ax.set_ylabel(yl, color=ink2)
    ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)

# 1) overview: breakover jump drawn as a dashed line (the negative-resistance
#    part cannot be measured with a voltage source)
ax = axes[0]; style(ax, 'Ig = 0: whole characteristic', 'Vak (V)', 'I (A)')
ax.plot(u["T1.V"][:vbo_i], u["T1.I"][:vbo_i], color=blue, lw=2, label='Vs rising')
ax.plot(u["T1.V"][vbo_i:], u["T1.I"][vbo_i:], color=blue, lw=2)
ax.plot([u["T1.V"][vbo_i - 1], u["T1.V"][vbo_i]],
        [u["T1.I"][vbo_i - 1], u["T1.I"][vbo_i]], color=ink2, lw=1.2, ls=':')
ax.plot(d["T1.V"], d["T1.I"], color=orange, lw=2, ls='--', label='Vs falling')
ax.annotate('breakover Vbo', (u["T1.V"][vbo_i - 1], 0.3), xytext=(60, 6),
            color=ink2, arrowprops=dict(arrowstyle='->', color=ink2))
ax.legend(frameon=False, labelcolor=ink2, loc='center left')
# 2) off-state leakage (microamps)
ax = axes[1]; style(ax, 'Off-state (blocking) region', 'Vak (V)', 'I (uA)')
ax.plot(u["T1.V"][:vbo_i], u["T1.I"][:vbo_i] * 1e6, color=blue, lw=2)
ax.axvline(100, color=axis_c, lw=1); ax.text(60, ax.get_ylim()[1] * 0.85, 'Vbo = 100 V', color=ink2)
# 3) on-state, both gate conditions
ax = axes[2]; style(ax, 'On-state: Vak = Von + Ron I', 'Vak (V)', 'I (A)')
ax.plot(d["T1.V"], d["T1.I"], color=orange, lw=2, label='Ig = 0, after breakover')
ax.plot(up[1]["T1.V"], up[1]["T1.I"], color=green, lw=2, ls='--', label='Ig = 8 mA')
ax.set_xlim(0.8, 2.2); ax.set_ylim(-0.5, 20)
ax.legend(frameon=False, labelcolor=ink2, loc='upper left')
fig.tight_layout(); fig.savefig("thyristor_iv.png", dpi=150, facecolor=surface)
