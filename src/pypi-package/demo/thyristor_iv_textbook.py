#-------------------------------------------------------------------------------
# Name:        Thyristor I(V) characteristic in the textbook form
# Author:      d.fathi
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# The classic SCR curve: reverse blocking and reverse breakdown (-V, -I),
# forward blocking up to the breakover voltage, the (unmeasurable) negative
# resistance part (dashed), the holding current and the ON state, and the
# gate-triggered turn-on.  The currents are EXAGGERATED on purpose (leakage of
# hundreds of mA, Roff = 500 Ohm) so that the blocking region is visible
# next to the ON state, as in a textbook drawing; with datasheet values see
# thyristor_iv.py.  Every branch is produced by DC sweeps of a source with a
# series resistor (Rs); the up/down sweeps run through the latch hysteresis.

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DCVoltage, Resistor, Thyristor

Vs = DCVoltage("s", "0")
Rs = Resistor("s", "a");      Rs.setParams("R=20Ω")
T1 = Thyristor("a", "g", "0")
T1.setParams("Von=5V Ron=2Ω Roff=500Ω Rrev=20KΩ Igt=2mA Ih=0.3A Vbo=100V "
             "Vrb=150V Rrb=2Ω")
Vgd = DCVoltage("gd", "0");   Vgd.setParams("Vdc=0V")
Rg = Resistor("gd", "g");     Rg.setParams("R=300Ω")

cir = circuit()
cir.addElements({"Vs": Vs, "Rs": Rs, "T1": T1, "Vgd": Vgd, "Rg": Rg})
cir.setOutPuts("T1.V", "T1.I")
cir.analysis(mode="dc", param="Vs.Vdc", start=-260, stop=220, step=0.25)
cir.sweep(param="Vgd.Vdc", list=[0.0, 3.0])        # Ig = 0 and Ig = 8 mA
up = cir.run()
cir.analysis(mode="dc", param="Vs.Vdc", start=220, stop=-260, step=-0.25)
down = cir.run()

V0, I0 = up[0]["T1.V"], up[0]["T1.I"]
jump = np.argmax(I0 > 1.0)                         # first on-state point (Ig = 0)
Vd, Id = down[0]["T1.V"], down[0]["T1.I"]
hold = np.argmax(Id < 0.15) - 1                    # last on-state point going down
Vg_, Ig_ = up[1]["T1.V"], up[1]["T1.I"]

print("breakover: Vak = %.1f V, blocking current %.0f mA (Vbo = 100 V)"
      % (V0[jump - 1], 1e3 * I0[jump - 1]))
print("holding  : the ON state ends at I = %.0f mA, Vak = %.2f V (Ih = 300 mA, "
      "Von + Ron Ih = %.2f V)" % (1e3 * Id[hold], Vd[hold], 5 + 2 * 0.3))
i_rb = np.argmax(I0 < -1.0)
print("reverse breakdown: Vak = %.1f V at I = %.2f A (Vrb + Rrb |I| = %.1f V)"
      % (V0[i_rb], I0[i_rb], -(150 + 2 * abs(I0[i_rb]))))
print("gate 8 mA: ON from Vak = %.2f V onwards (no breakover)"
      % Vg_[np.argmax(Ig_ > 0.5)])

# ---- the figure (textbook style) -----------------------------------------------------
surface, ink, ink2, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#898781'
blue, orange, green = '#2a78d6', '#eb6834', '#1baf7a'
fig, ax = plt.subplots(figsize=(8.6, 6.2), facecolor=surface)
ax.set_facecolor(surface)
ax.fill_between([0, 215], 0, 10.5, color='#e3f1e3', zorder=0)        # forward bias
ax.fill_between([-230, 0], -5.5, 0, color='#e3f1e3', zorder=0)       # reverse bias
fwd = (V0 >= 0) & (np.arange(len(V0)) < jump)
ax.plot(V0[fwd], I0[fwd], color=blue, lw=2.4, zorder=3)          # forward blocking
rev = V0 < 0
ax.plot(V0[rev], I0[rev], color=blue, lw=2.4, zorder=3)          # reverse
on = np.arange(len(Vd)) <= hold
ax.plot(Vd[on], Id[on], color=blue, lw=2.4, zorder=3)            # ON state
ax.plot([V0[jump - 1], Vd[hold]], [I0[jump - 1], Id[hold]], color=blue, lw=2.4,
        ls=(0, (2, 2)), zorder=3)                                # negative resistance
gate = (Vg_ >= 0)
ax.plot(Vg_[gate], Ig_[gate], color=green, lw=6, alpha=0.45, zorder=2,
        solid_capstyle='round')               # gate-triggered turn-on
ax.axhline(0, color=ink, lw=1); ax.axvline(0, color=ink, lw=1)
# compressed (symlog) axes: linear near the origin, logarithmic farther away, so
# the blocking region, the holding point and the ON state fit in one drawing
ax.set_xscale('symlog', linthresh=20, linscale=1.0)
ax.set_yscale('symlog', linthresh=0.5, linscale=1.0)
ax.set_xlim(-230, 215); ax.set_ylim(-5.5, 10.5)
ax.minorticks_off(); ax.set_xticks([]); ax.set_yticks([])
for s in ax.spines.values(): s.set_visible(False)
def note(text, xy, xytext, **kw):
    ax.annotate(text, xy, xytext=xytext, color=ink2, fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color=ink2), **kw)
note('Breakover\nvoltage Vbo', (V0[jump - 1], I0[jump - 1]), (150, 1.6))
note('Holding current Ih', (Vd[hold], Id[hold]), (60, 0.9))
note('ON state', (Vd[len(Vd) // 6], Id[len(Vd) // 6]), (70, 6.5))
note('OFF state\nforward blocking', (55, 0.1), (110, -0.9))
note('Reverse blocking', (-70, -0.02), (-110, 0.9))
note('Reverse breakdown', (V0[i_rb], I0[i_rb]), (-60, -3.0))
note('Gate triggered ON\n(no breakover)', (Vg_[gate][np.argmax(Ig_[gate] > 1.5)], 1.5), (-110, 4.5))
ax.text(212, 0.25, '+V', color=ink2, ha='right'); ax.text(-228, 0.25, '−V', color=ink2)
ax.text(2, 8.5, '+I', color=ink2); ax.text(2, -4.6, '−I', color=ink2)
ax.set_title('Thyristor (SCR) I(V) characteristic - simulated (compressed axes)', loc='left',
             color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("thyristor_iv_textbook.png", dpi=150, facecolor=surface)
