#-------------------------------------------------------------------------------
# Name:        UJT relaxation oscillator
# Author:      d.fathi
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# R3 charges C1 from Vs until the emitter voltage reaches the peak voltage
# Vp ~ Eta VBB + Vd; the UJT then conducts, discharges C1 through the emitter
# and B1 until the valley voltage Vv, and switches off again.
#   VC1 : sawtooth between Vv and Vp
#   VB1 : positive pulse (the discharge current flows through R1)
#   VB2 : negative pulse (the same current lowers the voltage on R2)
# Period:  T = R3 C1 ln[(Vs - Vv) / (Vs - Vp)]  (charging)  + the short discharge time
#          (integrated from the static branch of the emitter characteristic)
# Vp and Vv are measured on the emitter characteristic Ve(Ie), traced here
# with a current source and a DC sweep.

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import (DCVoltage, DCCurrent, Resistor, Capacitor, UJT)

Vs_, R2_, R1_, R3_, C1_ = 12.0, 470.0, 47.0, 10e3, 100e-9

def circuit_osc():
    Vs = DCVoltage("Vs", "0");  Vs.setParams("Vdc=%gV" % Vs_)
    R3 = Resistor("Vs", "E");   R3.setParams("R=%gΩ" % R3_)
    C1 = Capacitor("E", "0");   C1.setParams("C=%gF" % C1_)
    R2 = Resistor("Vs", "B2");  R2.setParams("R=%gΩ" % R2_)
    R1 = Resistor("B1", "0");   R1.setParams("R=%gΩ" % R1_)
    Q1 = UJT("E", "B1", "B2")
    c = circuit()
    c.addElements({"Vs": Vs, "R3": R3, "C1": C1, "R2": R2, "R1": R1, "Q1": Q1})
    return c

# ---- emitter characteristic: emitter driven by a current source, R3 and C1 out ----
Vs = DCVoltage("Vs", "0");   Vs.setParams("Vdc=%gV" % Vs_)
R2 = Resistor("Vs", "B2");   R2.setParams("R=%gΩ" % R2_)
R1 = Resistor("B1", "0");    R1.setParams("R=%gΩ" % R1_)
Q = UJT("E", "B1", "B2")
Ie = DCCurrent("0", "E")
ch = circuit()
ch.addElements({"Vs": Vs, "R2": R2, "R1": R1, "Q": Q, "Ie": Ie})
ch.setOutPuts("E")
# two sweeps: fine around the peak (microamperes), coarse up to 0.3 A
ch.analysis(mode="dc", param="Ie.Idc", start=1e-8, stop=1e-3, step=2e-7)
r1 = ch.run()
ch.analysis(mode="dc", param="Ie.Idc", start=1e-3 + 3e-5, stop=0.3, step=3e-5)
r2 = ch.run()
ve = np.concatenate([r1["E"], r2["E"]])
ie = np.concatenate([r1["sweep"], r2["sweep"]])
low = ie < 1e-3                              # the peak is at a few microamperes
ip = np.argmax(np.where(low, ve, -1e9))
mid = (ie > ie[ip]) & (ie < 3e-2)            # the valley is at a few milliamperes
iv = np.argmin(np.where(mid, ve, 1e9))
Vp, Vv = ve[ip], ve[iv]
print("emitter characteristic: peak Vp = %.2f V (Ip = %.0f uA), valley Vv = %.2f V "
      "(Iv = %.1f mA)" % (Vp, ie[ip] * 1e6, Vv, ie[iv] * 1e3))
print("a relaxation oscillation needs  Ip < (Vs - Vp)/R3 = %.0f uA  and  "
      "(Vs - Vv)/R3 = %.2f mA < Iv" % ((Vs_ - Vp) / R3_ * 1e6, (Vs_ - Vv) / R3_ * 1e3))

# ---- the oscillator -------------------------------------------------------------------
osc = circuit_osc()
osc.setOutPuts("E", "B1", "B2")
osc.analysis(mode="tran", start=0, stop=6e-3, step=2e-7, uic=True,
             adaptive=True, order=2)
r = osc.run()
t, e, b1, b2 = r["time"], r["E"], r["B1"], r["B2"]
fire = t[1:][(e[:-1] > 0.5 * (Vp + Vv)) & (e[1:] <= 0.5 * (Vp + Vv))]  # falling edges
T_sim = np.mean(np.diff(fire[1:]))
T_chg = R3_ * C1_ * np.log((Vs_ - Vv) / (Vs_ - Vp))
# discharge: C dVe/dt = (Vs - Ve)/R3 - Ie(Ve), with Ie(Ve) taken from the static
# conducting branch of the emitter characteristic (beyond the valley)
# At the peak the emitter current jumps (Ve cannot, C1 holds it) onto the
# conducting branch beyond the valley, along which C1 discharges down to Vv.
vb, ib = ve[iv:], ie[iv:]                              # Ve increasing with Ie
v_grid = np.linspace(Vv, Vp, 4000)
i_of_v = np.interp(v_grid, vb, ib)
dt_dv = C1_ / (i_of_v - (Vs_ - v_grid) / R3_)
T_dis = np.trapezoid(dt_dv, v_grid) if hasattr(np, "trapezoid") else np.trapz(dt_dv, v_grid)
T_ref = T_chg + T_dis
late = t > 3e-3
print("oscillator: period %.0f us | R3 C1 ln(...) charging %.0f us + discharge "
      "%.0f us = %.0f us" % (T_sim * 1e6, T_chg * 1e6, T_dis * 1e6, T_ref * 1e6))
print("            VC1 swings between %.2f and %.2f V" % (e[late].min(), e[late].max()))
print("pulses: VB1 peak %.2f V (positive), VB2 dips to %.2f V (negative) from %.2f V"
      % (b1[late].max(), b2[late].min(), b2[late].max()))

# ---- figure ---------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, axs = plt.subplots(3, 1, sharex=True, figsize=(9, 8), facecolor=surface)
for ax, y, col, name in zip(axs, (e, b2, b1), ('#2a78d6', '#eb6834', '#1baf7a'),
                            ('VC1 (emitter)', 'VB2 (negative pulse)', 'VB1 (positive pulse)')):
    ax.set_facecolor(surface)
    ax.plot(t * 1e3, y, color=col, lw=1.8)
    ax.set_title(name, loc='left', fontsize=10, color=ink2)
    ax.set_ylabel('Voltage (V)', color=ink2)
    ax.grid(axis='y', color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
axs[1].set_ylim(b2[late].min() - 0.3, b2[late].max() + 0.3)   # zoom on the pulses
axs[0].axhline(Vp, color=axis_c, lw=1, ls='--'); axs[0].axhline(Vv, color=axis_c, lw=1, ls='--')
axs[0].text(5.95, Vp + 0.2, 'Vp', color=ink2, ha='right'); axs[0].text(5.95, Vv - 0.9, 'Vv', color=ink2, ha='right')
axs[-1].set_xlabel('Time (ms)', color=ink2)
fig.suptitle('UJT relaxation oscillator (R3 = 10 k, C1 = 100 nF, Vs = 12 V)', x=0.01,
             ha='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("ujt_oscillator.png", dpi=150, facecolor=surface)

# emitter characteristic figure
fig2, ax = plt.subplots(figsize=(6.4, 4.4), facecolor=surface)
ax.set_facecolor(surface)
ax.semilogx(ie[ie < 0.1] * 1e3, ve[ie < 0.1], color='#2a78d6', lw=2)
ax.plot([ie[ip] * 1e3, ie[iv] * 1e3], [Vp, Vv], 'o', color='#eb6834')
ax.annotate('peak point', (ie[ip] * 1e3, Vp), xytext=(2e-3, Vp - 0.8), color=ink2,
            arrowprops=dict(arrowstyle='->', color=ink2))
ax.annotate('valley point', (ie[iv] * 1e3, Vv), xytext=(0.15, Vv + 2.2), color=ink2,
            arrowprops=dict(arrowstyle='->', color=ink2))
ax.set_xlabel('Emitter current Ie (mA)', color=ink2); ax.set_ylabel('Emitter voltage Ve (V)', color=ink2)
ax.set_title('UJT emitter characteristic', loc='left', color=ink, fontsize=12)
ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
for s in ('top', 'right'): ax.spines[s].set_visible(False)
for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
ax.tick_params(colors=ink2)
fig2.tight_layout(); fig2.savefig("ujt_characteristic.png", dpi=150, facecolor=surface)
