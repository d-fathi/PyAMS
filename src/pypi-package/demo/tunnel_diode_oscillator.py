#-------------------------------------------------------------------------------
# Name:        Tunnel diode oscillator
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# The tunnel diode is biased in the middle of its negative-resistance region
# through Rl and L; C is in parallel with the diode.  The negative conductance
# -g cancels the losses of the tank (Rl): oscillation starts when
#       |g| > Rl C / L
# and grows until the nonlinearity of I(V) limits the amplitude.
# Frequency ~ 1 / (2 pi sqrt(L (C + Cj))).
# Check: the same circuit integrated with scipy (solve_ivp) from I(V) written
# independently, and the frequency from the FFT.

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from pyams.lib import circuit
from pyams.models import DCVoltage, TrapezoidVoltage, Resistor, Inductor, Capacitor, TunnelDiode

Vb_, Rl_, L_, C_ = 0.25, 5.0, 1e-6, 100e-12
Ip, Vp, Ix, Vx, Kex, Is, Vt, Cj = 5e-3, 0.1, 1e-4, 0.35, 15.0, 1e-12, 0.025, 10e-12

def Idiode(v):
    return (Ip * (v / Vp) * np.exp(1 - v / Vp)
            + Ix * (np.exp(Kex * (v - Vx)) - np.exp(-Kex * Vx))
            + Is * (np.exp(v / Vt) - 1))

# ---- I(V) characteristic: voltage drive, DC sweep ---------------------------------
V = DCVoltage("A", "0");  V.setParams("Vdc=0V")
D = TunnelDiode("A", "0")
ch = circuit(); ch.addElements({"V": V, "D": D})
ch.setOutPuts("A")
ch.analysis(mode="dc", param="V.Vdc", start=0.0, stop=0.6, step=0.002)
rc = ch.run()
vs = np.array(rc["sweep"]); ids = Idiode(vs)
# current from the simulator: through the source  (compare with the formula)
# the sweep gives the voltage only, so we compare the peak/valley found from the
# analytical curve with the model through the bias point below.
ip_ = np.argmax(np.where(vs < 0.25, ids, -1)); iv_ = ip_ + np.argmin(ids[ip_:int(0.5 / 0.002)])
print("I(V): peak Vp = %.3f V, Ip = %.2f mA | valley Vv = %.3f V, Iv = %.2f mA | Ip/Iv = %.1f"
      % (vs[ip_], ids[ip_] * 1e3, vs[iv_], ids[iv_] * 1e3, ids[ip_] / ids[iv_]))
neg = np.gradient(ids, vs) < 0
print("negative resistance region: %.2f V ... %.2f V, min slope %.1f mS (%.0f ohm)"
      % (vs[neg][0], vs[neg][-1], np.gradient(ids, vs).min() * 1e3, 1 / np.gradient(ids, vs).min()))

# ---- oscillator ---------------------------------------------------------------
Vsrc = TrapezoidVoltage("Vb", "0")          # supply switched on at t = 0 -> start-up kick
Vsrc.setParams("V0=0V"); Vsrc.setParams("V1=%gV" % Vb_)
Vsrc.setParams("Td=0"); Vsrc.setParams("Tr=1e-9"); Vsrc.setParams("Tw=1"); Vsrc.setParams("Tf=1e-9"); Vsrc.setParams("T=2")
Rl = Resistor("Vb", "X");  Rl.setParams("R=%gΩ" % Rl_)
L = Inductor("X", "D");    L.setParams("L=%gH" % L_)
C = Capacitor("D", "0");   C.setParams("C=%gF" % C_)
TD = TunnelDiode("D", "0")
osc = circuit()
osc.addElements({"Vb": Vsrc, "Rl": Rl, "L": L, "C": C, "TD": TD})
osc.setOutPuts("D", "X")
tstop, dt = 2e-6, 0.2e-9
osc.analysis(mode="tran", start=0, stop=tstop, step=dt, uic=True, adaptive=True, order=2)
r = osc.run()
t, vd, vx = np.array(r["time"]), np.array(r["D"]), np.array(r["X"])
# inductor current = (Vb(t) - vx)/Rl
vb = np.interp(t, [0, 1e-9, 1], [0, Vb_, Vb_])
iL = (vb - vx) / Rl_

# ---- independent reference ---------------------------------------------------------
def rhs(tt, y):
    v, i = y
    vbt = Vb_ * min(tt / 1e-9, 1.0)
    return [(i - Idiode(v)) / (C_ + Cj), (vbt - Rl_ * i - v) / L_]
ref = solve_ivp(rhs, [0, tstop], [0.0, 0.0], t_eval=t, method="Radau", rtol=1e-8, atol=1e-12,
                max_step=1e-9)
vr = ref.y[0]

late = t > 1.2e-6
def freq_of(sig, tt):
    m = tt > 1.2e-6
    s = sig[m] - sig[m].mean(); tm = tt[m]
    tu = np.arange(tm[0], tm[-1], 0.05e-9); su = np.interp(tu, tm, s)
    F = np.abs(np.fft.rfft(su * np.hanning(len(su)))); fr = np.fft.rfftfreq(len(su), 0.05e-9)
    k = np.argmax(F[1:]) + 1
    # parabolic refinement
    a, b, c = np.log(F[k - 1:k + 2] + 1e-30)
    return fr[k] + 0.5 * (a - c) / (a - 2 * b + c) * (fr[1] - fr[0])

f_sim, f_ref = freq_of(vd, t), freq_of(vr, t)
f_lc = 1 / (2 * np.pi * np.sqrt(L_ * (C_ + Cj)))
gmax = -np.gradient(ids, vs).min()
print("start-up condition: |g| = %.1f mS  >  Rl C/L = %.2f mS  -> oscillates" % (gmax * 1e3, Rl_ * (C_ + Cj) / L_ * 1e3))
print("frequency: simulation %.2f MHz | scipy %.2f MHz | linear 1/(2 pi sqrt(LC)) %.2f MHz"
      % (f_sim / 1e6, f_ref / 1e6, f_lc / 1e6))
print("amplitude (steady state): sim %.3f..%.3f V | scipy %.3f..%.3f V"
      % (vd[late].min(), vd[late].max(), vr[late].min(), vr[late].max()))
print("amplitude difference %.2f %% of the swing; rms(sim - scipy) on the last 0.8 us = %.1f mV"
      % (100 * abs((vd[late].max() - vd[late].min()) - (vr[late].max() - vr[late].min()))
         / (vr[late].max() - vr[late].min()), 1e3 * np.sqrt(np.mean((vd[late] - vr[late]) ** 2))))
print("min / max of the diode voltage: %.4f / %.4f V" % (vd[late].min(), vd[late].max()))

# ---- figure -------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
def style(ax):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
fig, axs = plt.subplots(1, 3, figsize=(14, 4.4), facecolor=surface)
ax = axs[0]; style(ax)
ax.plot(vs, ids * 1e3, color='#2a78d6', lw=2)
ax.plot([vs[ip_], vs[iv_]], [ids[ip_] * 1e3, ids[iv_] * 1e3], 'o', color='#eb6834')
ax.annotate('peak', (vs[ip_], ids[ip_] * 1e3), xytext=(0.17, 5.0), color=ink2, arrowprops=dict(arrowstyle='->', color=ink2))
ax.annotate('valley', (vs[iv_], ids[iv_] * 1e3), xytext=(0.43, 3.0), color=ink2, arrowprops=dict(arrowstyle='->', color=ink2))
ax.axvspan(vs[neg][0], vs[neg][-1], color='#eb6834', alpha=0.08, lw=0)
ax.set_xlabel('V (V)', color=ink2); ax.set_ylabel('I (mA)', color=ink2)
ax.set_title('Tunnel diode I(V)', loc='left', color=ink, fontsize=11)
ax.set_ylim(0, 6)
ax = axs[1]; style(ax)
ax.plot(t * 1e9, vd, color='#2a78d6', lw=1.6, label='PyAMS')
ax.plot(t * 1e9, vr, color='#eb6834', lw=1, ls='--', label='scipy')
ax.set_xlabel('Time (ns)', color=ink2); ax.set_ylabel('V diode (V)', color=ink2)
ax.set_xlim(1700, 2000)
ax.set_title('Steady state (last 300 ns)', loc='left', color=ink, fontsize=11)
ax.legend(frameon=False, labelcolor=ink2, loc='upper right', ncol=2, bbox_to_anchor=(1, 1.2))
ax = axs[2]; style(ax)
ax.plot(vs, ids * 1e3, color=axis_c, lw=1.5)
ax.plot(vd[late], iL[late] * 1e3, color='#1baf7a', lw=1.6)
ax.set_xlabel('V diode (V)', color=ink2); ax.set_ylabel('I (mA)', color=ink2)
ax.set_title('Limit cycle in the (V, IL) plane', loc='left', color=ink, fontsize=11)
ax.set_ylim(0, 1.05 * iL[late].max() * 1e3)
fig.suptitle('Tunnel diode oscillator (Vb = 0.25 V, Rl = 5 Ω, L = 1 µH, C = 100 pF)', x=0.01, ha='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("tunnel_diode_oscillator.png", dpi=150, facecolor=surface)
