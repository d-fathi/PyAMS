#-------------------------------------------------------------------------------
# Name:        555 timer, astable multivibrator
# Created:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
# C charges from Vcc/3 to 2Vcc/3 through R1 + R2 (output high) and discharges
# through R2 into the discharge pin (output low).  THRES and TRIG are tied.
#   t_high = (R1 + R2) C ln 2        t_low = R2 C ln 2        f = 1.44 / ((R1 + 2 R2) C)
# Reference below includes the real discharge transistor (Rdis in parallel with R1).

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DCVoltage, Resistor, Capacitor, Timer555

Vcc_, R1_, R2_, C_ = 9.0, 1e3, 10e3, 100e-9

def build(R1=R1_, R2=R2_, C=C_):
    V = DCVoltage("Vcc", "0");  V.setParams("Vdc=%gV" % Vcc_)
    r1 = Resistor("Vcc", "D");  r1.setParams("R=%gΩ" % R1)
    r2 = Resistor("D", "T");    r2.setParams("R=%gΩ" % R2)
    c = Capacitor("T", "0");    c.setParams("C=%gF" % C)
    cc = Capacitor("CT", "0");  cc.setParams("C=10nF")       # decoupling of the control pin
    U = Timer555("T", "T", "CT", "Vcc", "D", "OUT", "Vcc", "0")
    ck = circuit()
    ck.addElements({"V": V, "R1": r1, "R2": r2, "C": c, "Cc": cc, "U": U})
    return ck

ck = build()
ck.setOutPuts("T", "OUT")
ck.analysis(mode="tran", start=0, stop=8e-3, step=1e-6, uic=True, adaptive=False, order=1)
r = ck.run()
t, vt, vo = np.array(r["time"]), np.array(r["T"]), np.array(r["OUT"])

mid = 0.5 * (vo.max() + vo.min())
up = t[1:][(vo[:-1] < mid) & (vo[1:] >= mid)]
dn = t[1:][(vo[:-1] >= mid) & (vo[1:] < mid)]
up = up[1:]; dn = dn[1:]                                  # skip the start-up
T_sim = np.mean(np.diff(up))
th_sim = np.mean([d - u for u in up for d in dn if 0 < d - u < T_sim][:len(up) - 1])
tl_sim = T_sim - th_sim

# reference
Rdis = 10.0
tau1 = (R1_ + R2_) * C_
th_ref = tau1 * np.log(2.0)
Rp = R1_ * Rdis / (R1_ + Rdis)
Vt_ = Vcc_ * Rdis / (R1_ + Rdis)
tau2 = (R2_ + Rp) * C_
tl_ref = tau2 * np.log((2 * Vcc_ / 3 - Vt_) / (Vcc_ / 3 - Vt_))
T_ref = th_ref + tl_ref
late = t > 3e-3
print("astable 555 (Vcc = %g V, R1 = %g k, R2 = %g k, C = %g nF)" % (Vcc_, R1_ / 1e3, R2_ / 1e3, C_ * 1e9))
print("  t_high : sim %.1f us | ref %.1f us (ideal (R1+R2) C ln2 = %.1f us)" % (th_sim * 1e6, th_ref * 1e6, 0.693147 * tau1 * 1e6))
print("  t_low  : sim %.1f us | ref %.1f us (ideal R2 C ln2 = %.1f us)" % (tl_sim * 1e6, tl_ref * 1e6, 0.693147 * R2_ * C_ * 1e6))
print("  period : sim %.1f us | ref %.1f us | f = %.1f Hz (1.44/((R1+2R2)C) = %.1f Hz)"
      % (T_sim * 1e6, T_ref * 1e6, 1 / T_sim, 1.44 / ((R1_ + 2 * R2_) * C_)))
print("  duty   : sim %.2f %% | ref %.2f %%" % (100 * th_sim / T_sim, 100 * th_ref / T_ref))
print("  capacitor swings %.3f .. %.3f V (Vcc/3 = %.3f, 2Vcc/3 = %.3f)" % (vt[late].min(), vt[late].max(), Vcc_ / 3, 2 * Vcc_ / 3))
print("  output levels %.2f V / %.2f V" % (vo[late].min(), vo[late].max()))

# parametric sweep of R2: frequency
R2s = [5e3, 10e3, 20e3]
fs = []
for R2v in R2s:
    k = build(R2=R2v); k.setOutPuts("OUT")
    k.analysis(mode="tran", start=0, stop=12e-3, step=1e-6, uic=True, adaptive=False, order=1)
    rr = k.run(); tt, v = np.array(rr["time"]), np.array(rr["OUT"])
    m = 0.5 * (v.max() + v.min()); u = tt[1:][(v[:-1] < m) & (v[1:] >= m)][1:]
    fs.append(1 / np.mean(np.diff(u)))
    tl = (R2v + Rp) * C_ * np.log((2 * Vcc_ / 3 - Vt_) / (Vcc_ / 3 - Vt_)); thr = (R1_ + R2v) * C_ * np.log(2)
    print("  R2 = %4.0f k : f sim %.1f Hz | ref %.1f Hz" % (R2v / 1e3, fs[-1], 1 / (tl + thr)))

surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, axs = plt.subplots(2, 1, sharex=True, figsize=(9, 6), facecolor=surface)
for ax, y, col, name in zip(axs, (vt, vo), ('#2a78d6', '#eb6834'), ('Capacitor (pins 2/6)', 'Output (pin 3)')):
    ax.set_facecolor(surface); ax.plot(t * 1e3, y, color=col, lw=1.8)
    ax.set_title(name, loc='left', fontsize=10, color=ink2); ax.set_ylabel('Voltage (V)', color=ink2)
    ax.grid(axis='y', color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
axs[0].axhline(Vcc_ / 3, color=axis_c, ls='--', lw=1); axs[0].axhline(2 * Vcc_ / 3, color=axis_c, ls='--', lw=1)
axs[0].text(7.95, 2 * Vcc_ / 3 + 0.2, '2/3 Vcc', ha='right', color=ink2); axs[0].text(7.95, Vcc_ / 3 - 0.8, '1/3 Vcc', ha='right', color=ink2)
axs[1].set_xlabel('Time (ms)', color=ink2)
fig.suptitle('555 astable (Vcc = 9 V, R1 = 1 k, R2 = 10 k, C = 100 nF): f = %.0f Hz, duty %.0f %%' % (1 / T_sim, 100 * th_sim / T_sim),
             x=0.01, ha='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("timer555_astable.png", dpi=150, facecolor=surface)
