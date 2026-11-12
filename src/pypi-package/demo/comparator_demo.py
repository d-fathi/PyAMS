#-------------------------------------------------------------------------------
# Name:        Comparator: hysteresis loop and RC relaxation oscillator
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# 1) Hysteresis loop: a DC sweep of the input up and then down.  With
#    Vhys = 0.4 V the output switches high at +0.2 V and low at -0.2 V.
# 2) Relaxation oscillator: the comparator output charges C through R, the
#    inverting input is the capacitor voltage and the other input is a 2.5 V
#    reference.  With Vhys = 1 V the capacitor swings between 2.0 V and 3.0 V:
#        T = 2 (R + Ro) C ln[(Voh - 2.0) / (Voh - 3.0)] = 2 (R + Ro) C ln 1.5

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DCVoltage, Resistor, Capacitor, Comparator

# ---- 1) hysteresis loop ------------------------------------------------------
Vi = DCVoltage("in", "0")
Vr = DCVoltage("ref", "0");     Vr.setParams("Vdc=0V")
U1 = Comparator("in", "ref", "out");  U1.setParams("Vhys=0.4V Voh=5V Vol=0V")
RL = Resistor("out", "0");      RL.setParams("R=100KΩ")
cir = circuit()
cir.addElements({"Vi": Vi, "Vr": Vr, "U1": U1, "RL": RL})
cir.setOutPuts("out")
cir.analysis(mode="dc", param="Vi.Vdc", start=-1.0, stop=1.0, step=0.005)
up = cir.run()                    # the state of the comparator is kept ...
cir.analysis(mode="dc", param="Vi.Vdc", start=1.0, stop=-1.0, step=-0.005)
down = cir.run()                  # ... so the way back draws the other branch
mid = 0.5 * (up["out"].max() + up["out"].min())
t_up = up["sweep"][np.argmax(up["out"] > mid)]
t_dn = down["sweep"][np.argmax(down["out"] < mid)]
print("hysteresis loop: switches high at %+.3f V (expected +0.200), "
      "low at %+.3f V (expected -0.200)" % (t_up, t_dn))

surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, ax = plt.subplots(figsize=(6.4, 4.2), facecolor=surface)
ax.set_facecolor(surface)
ax.plot(up["sweep"], up["out"], color='#2a78d6', lw=2, label='input rising')
ax.plot(down["sweep"], down["out"], color='#eb6834', lw=2, ls='--', label='input falling')
ax.set_xlabel('Input voltage Vd (V)', color=ink2); ax.set_ylabel('Output (V)', color=ink2)
ax.set_title('Comparator with hysteresis (Vhys = 0.4 V)', loc='left', color=ink, fontsize=12)
ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
for s in ('top', 'right'): ax.spines[s].set_visible(False)
for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
ax.tick_params(colors=ink2); ax.legend(frameon=False, labelcolor=ink2)
fig.tight_layout(); fig.savefig("comparator_loop.png", dpi=150, facecolor=surface)

# ---- 2) RC relaxation oscillator ----------------------------------------------
Vref = DCVoltage("ref", "0");   Vref.setParams("Vdc=2.5V")
U2 = Comparator("ref", "c", "out");   U2.setParams("Vhys=1V Voh=5V Vol=0V")
R = Resistor("out", "c");       R.setParams("R=10KΩ")
C = Capacitor("c", "0");        C.setParams("C=100nF")
osc = circuit()
osc.addElements({"Vref": Vref, "U2": U2, "R": R, "C": C})
osc.setOutPuts("out", "c")
# the state of a comparator changes at accepted time points, so bound the step
osc.analysis(mode="tran", start=0, stop=5e-3, step=1e-6, uic=True,
             adaptive=True, order=2, max_step=2e-6)
r = osc.run()
t, vc = r["time"], r["c"]
cross = t[1:][(vc[:-1] < 2.5) & (vc[1:] >= 2.5)]      # rising crossings of 2.5 V
T_sim = np.mean(np.diff(cross[1:]))
T_ref = 2 * (10e3 + 50.0) * 100e-9 * np.log(1.5)
print("oscillator period: simulated %.1f us, analytic %.1f us (%.2f %%)"
      % (T_sim * 1e6, T_ref * 1e6, 100 * (T_sim / T_ref - 1)))
print("capacitor swings between %.3f V and %.3f V (expected 2.000 / 3.000)"
      % (vc[t > 2e-3].min(), vc[t > 2e-3].max()))
osc.plot("comparator_oscillator.png", show=False)
