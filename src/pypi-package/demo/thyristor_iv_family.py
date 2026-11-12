#-------------------------------------------------------------------------------
# Name:        Thyristor I(V) with several gate currents (IG0 ... IG3)
# Updated:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# The textbook characteristic of an SCR with a family of gate currents:
#   forward blocking (blocage direct), reverse blocking (blocage inverse),
#   reverse breakdown (claquage inverse), the breakover voltage VBo that falls
#   as the gate current grows IG0 < IG1 < IG2 < IG3, the threshold voltage VT,
#   the holding current IH and the latching current IL of the ON state (passant).
#
# Every solid branch is a DC sweep of a source with a series resistor; the
# gate current comes from a DCCurrent source and is changed with sweep().
# The negative-resistance part between breakover and the ON state cannot be
# measured by a voltage sweep (the latch jumps over it): it is drawn as a
# smooth dashed curve between the two measured ends.  The currents are
# exaggerated (Roff = 2 kOhm) and the axes compressed (linear near the
# origin, logarithmic farther away), as in a textbook drawing.

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DCVoltage, DCCurrent, Resistor, Thyristor

Vs = DCVoltage("s", "0")
Rs = Resistor("s", "a");      Rs.setParams("R=10Ω")
T1 = Thyristor("a", "g", "0")
T1.setParams("Von=5V Ron=2Ω Roff=2KΩ Rrev=20KΩ Igt=2mA Ih=0.3A Il=0.6A "
             "Vbo=100V Vrb=150V Rrb=2Ω")
Ig = DCCurrent("0", "g")                  # gate current source (into the gate)

cir = circuit()
cir.addElements({"Vs": Vs, "Rs": Rs, "T1": T1, "Ig": Ig})
cir.setOutPuts("T1.V", "T1.I")
gate_mA = [0.0, 0.4, 0.9, 1.5]            # IG0 ... IG3 (Igt = 2 mA)
cir.analysis(mode="dc", param="Vs.Vdc", start=-260, stop=220, step=0.25)
cir.sweep(param="Ig.Idc", list=[g * 1e-3 for g in gate_mA])
up = cir.run()
cir.analysis(mode="dc", param="Vs.Vdc", start=220, stop=-260, step=-0.25)
down = cir.run()

# ---- numbers from the sweeps -------------------------------------------------------
Von, Ron, Ih, Il = 5.0, 2.0, 0.3, 0.6
bo = []                                    # (V, I) at breakover for every IG
for g, r in zip(gate_mA, up):
    V, I = r["T1.V"], r["T1.I"]
    j = np.argmax((I > 1.0) & (V > -1))    # first point of the ON state
    # (with Ig = 0 the blocking branch is the one before the jump)
    bo.append((V[j - 1], I[j - 1], j))
    print("IG = %.1f mA : breakover at Vak = %6.1f V (formula Vbo (1 - IG/Igt) = %5.1f V)"
          % (g, V[j - 1], 100.0 * (1 - g / 2.0)))
Vd, Id = down[0]["T1.V"], down[0]["T1.I"]
hold = np.argmax(Id < 0.15) - 1
print("holding : the ON state ends at I = %.0f mA (Ih = 300 mA), Vak = %.2f V "
      "(VT = Von + Ron Ih = %.2f V)" % (1e3 * Id[hold], Vd[hold], Von + Ron * Ih))

# ---- compressed axes -----------------------------------------------------------------
LX = 20.0
tx = lambda v: np.sign(v) * np.log10(1 + np.abs(v) / LX)
# currents: linear for I >= 0 (blocking, IH, IL and the start of the ON state
# are in the same range), compressed for the large reverse breakdown current
ty = lambda i: np.where(np.asarray(i) >= 0, i, -0.45 * np.log10(1 + np.abs(i) / 0.1))

def bezier(p0, p1, c1, c2, n=60):
    s = np.linspace(0, 1, n)[:, None]
    return ((1 - s) ** 3 * p0 + 3 * (1 - s) ** 2 * s * c1
            + 3 * (1 - s) * s ** 2 * c2 + s ** 3 * p1)

surface, ink, ink2, guide = '#fcfcfb', '#0b0b0b', '#52514e', '#898781'
red = '#d6342a'
fig, ax = plt.subplots(figsize=(9.2, 6.2), facecolor=surface)
ax.set_facecolor(surface)
# reverse branch (blocking + breakdown) and the forward blocking branches
V0, I0 = up[0]["T1.V"], up[0]["T1.I"]
rev = V0 < 0
ax.plot(tx(V0[rev]), ty(I0[rev]), color=red, lw=2.2)
vt = Von + Ron * Ih
hold_pt = (tx(Vd[hold]), ty(Id[hold]))
on_pt = (tx(Von + Ron * Il), ty(Il))
for k, (g, r) in enumerate(zip(gate_mA, up)):
    V, I = r["T1.V"], r["T1.I"]
    vb, ib, j = bo[k]
    m = (np.arange(len(V)) < j) & (V >= 0)
    ax.plot(tx(V[m]), ty(I[m]), color=red, lw=2.2 if k == 0 else 1.4)
    p0 = np.array([tx(vb), ty(ib)])
    p1 = np.array(hold_pt if k == 0 else on_pt)
    dy = p1[1] - p0[1]
    if k == 0:       # the S of IG0: rounded bulge at VBo, then up and to the left
        c1 = np.array([p0[0] + 0.07, p0[1] + 0.95 * dy])
        c2 = np.array([p1[0] + 0.45 * (p0[0] - p1[0]), p1[1] + 0.15 * dy])
    else:
        c1 = np.array([p0[0] + 0.02, p0[1] + 0.55 * dy])
        c2 = np.array([p1[0] + 0.45 * (p0[0] - p1[0]), p1[1] - 0.45 * dy])
    curve = bezier(p0, p1, c1, c2)
    ax.plot(curve[:, 0], curve[:, 1], color=red, lw=2.2 if k == 0 else 1.4,
            ls=(0, (4, 2)))
    ax.text(p0[0] + 0.03, p0[1] + 0.06, 'I$_{G%d}$' % k, color=red, fontsize=11)
# ON state: the measured branch from the holding point upwards
on = (np.arange(len(Vd)) <= hold) & (Id <= 1.7)           # show only the start
ax.plot(tx(Vd[on]), ty(Id[on]), color=red, lw=2.2)
ax.text(tx(Vd[on][-1]) + 0.05, 1.45, 'ON state', color=red, fontsize=11)
# guides for VT, VBo, IH, IL
for x, y0, y1 in ((tx(vt), 0, Ih), (tx(bo[0][0]), 0, bo[0][1])):
    ax.plot([x, x], [y0, y1], color=ink, lw=0.8, ls='--')
ax.plot([0, tx(vt)], [Ih, Ih], color=ink, lw=0.8, ls='--')
ax.plot([0, on_pt[0]], [Il, Il], color=ink, lw=0.8, ls='--')
ax.axhline(0, color=ink, lw=1.2); ax.axvline(0, color=ink, lw=1.2)
xmax = tx(215)
ax.set_xlim(tx(-230), xmax); ax.set_ylim(float(ty(-5.5)), 1.75)
ax.minorticks_off()
ax.set_xticks([tx(vt), tx(bo[0][0])]); ax.set_xticklabels(['V$_T$', 'V$_{Bo}$'], fontsize=12)
ax.set_yticks([Ih, Il]); ax.set_yticklabels(['I$_H$', 'I$_L$'], fontsize=12)
ax.tick_params(length=0, pad=6, colors=ink)
ax.xaxis.set_ticks_position('bottom'); ax.yaxis.set_ticks_position('left')
for s in ('top', 'right'): ax.spines[s].set_visible(False)
ax.spines['left'].set_position('zero'); ax.spines['bottom'].set_position('zero')
ax.spines['left'].set_color(ink); ax.spines['bottom'].set_color(ink)
ax.text(xmax, 0.05, 'V$_{AK}$', ha='right', va='bottom', color=ink, fontsize=12)
ax.text(0.04, 1.65, 'I$_D$', color=ink, fontsize=12)
ax.annotate('forward blocking', (tx(55), ty(0.03)), xytext=(tx(70), -0.25),
            color=red, fontsize=11, ha='left', arrowprops=dict(arrowstyle='->', color=red))
ax.text(tx(-120), 0.12, 'reverse blocking', color=red, fontsize=11, ha='center')
ax.text(tx(-100), -0.55, 'reverse breakdown', color=red, fontsize=11, ha='left')
ax.set_title('SCR characteristic I(V) for several gate currents (simulated)',
             loc='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("thyristor_iv_family.png", dpi=150, facecolor=surface)
