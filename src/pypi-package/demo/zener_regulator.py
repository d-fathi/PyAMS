#-------------------------------------------------------------------------------
# Name:        Zener diode: I(V) characteristic and shunt regulator
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# 1) I(V) of the zener: forward knee at ~0.6 V and reverse breakdown at -Vz.
# 2) Shunt regulator  Vin -- Rs -- (zener || RL):
#      line regulation  : Vout against Vin (DC sweep), one curve per load RL
#      load regulation  : Vout against RL at Vin = 12 V
#      ripple rejection : 12 V + 2 V (100 Hz) ripple, attenuation
#                         (rz || RL) / (Rs + rz || RL),  rz = dynamic resistance
# Reference: the same I(V) equation written independently in numpy and the
# regulator solved with brentq; rz is the numerical derivative at the operating point.

import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import brentq
from pyams.lib import circuit
from pyams.models import DCVoltage, SinVoltage, Resistor, ZenerDiode

Vz, Ibv, Nz, Rz, Is, Vt = 5.1, 1e-3, 1.5, 5.0, 1e-14, 0.025
Rs_, Vin_ = 220.0, 12.0

def Iz(v):
    """current anode -> cathode of the zener (independent numpy version)"""
    v = np.asarray(v, float)
    vb = -(v + Vz)
    return Is * (np.exp(np.minimum(v, 40 * Vt) / Vt) - 1) - Ibv * np.exp(vb / (Nz * Vt)) - np.where(vb > 0, vb / Rz, 0.0)

# ---- 1) I(V) -----------------------------------------------------------------
V = DCVoltage("A", "0");  V.setParams("Vdc=0V")
Rm = Resistor("A", "B");  Rm.setParams("R=1Ω")                 # 1 ohm current sense
D = ZenerDiode("B", "0")
c1 = circuit(); c1.addElements({"V": V, "Rm": Rm, "D": D}); c1.setOutPuts("A", "B")
c1.analysis(mode="dc", param="V.Vdc", start=-8.0, stop=1.0, step=0.01)
r1 = c1.run()
vd = np.array(r1["B"]); idd = (np.array(r1["A"]) - vd) / 1.0
err = np.max(np.abs(idd - Iz(vd)) / (np.abs(Iz(vd)) + 1e-6))
k = np.argmin(np.abs(idd + 1e-3))
print("I(V): max relative difference with the numpy equation %.2e" % err)
print("      reverse current = 1 mA at V = %.3f V (Vz = %g) | forward 1 mA at V = %.3f V"
      % (vd[k], Vz, vd[np.argmin(np.abs(idd - 1e-3))]))
for ia in (0.1e-3, 1e-3, 5e-3, 20e-3):
    kk = np.argmin(np.abs(idd + ia)); print("      |I| = %5.1f mA at V = %.3f V" % (ia * 1e3, vd[kk]))

# ---- 2) shunt regulator --------------------------------------------------------
def regulator(RL, Vin=Vin_):
    f = lambda vo: (Vin - vo) / Rs_ - vo / RL + Iz(-vo)            # KCL at the output
    return brentq(f, -1.0, Vin + 1.0)

def build(RL=1e3, src="dc"):
    if src == "dc":
        s = DCVoltage("Vin", "0"); s.setParams("Vdc=%gV" % Vin_)
    else:
        s = SinVoltage("Vin", "0"); s.setParams("Va=2V Fr=100Hz Voff=%gV" % Vin_)
    rs = Resistor("Vin", "Vout"); rs.setParams("R=%gΩ" % Rs_)
    z = ZenerDiode("0", "Vout")                                       # cathode on the output
    rl = Resistor("Vout", "0");   rl.setParams("R=%gΩ" % RL)
    ck = circuit(); ck.addElements({"V": s, "Rs": rs, "Z": z, "RL": rl}); ck.setOutPuts("Vout")
    return ck

RLs = [220.0, 470.0, 1e3, 4.7e3]
fam = build(1e3); fam.analysis(mode="dc", param="V.Vdc", start=0.0, stop=20.0, step=0.05)
fam.sweep(param="RL.R", list=RLs)
rf = fam.run()
print("line regulation (Rs = %g ohm):" % Rs_)
vin = np.array(rf[0]["sweep"])
worst = 0
for RL, r in zip(RLs, rf):
    vo = np.array(r["Vout"]); ref = np.array([regulator(RL, v) for v in vin])
    e = np.max(np.abs(vo - ref)); worst = max(worst, e)
    i10, i15 = np.argmin(abs(vin - 10)), np.argmin(abs(vin - 15))
    print("  RL = %5.0f ohm : Vout(10 V) = %.3f, Vout(15 V) = %.3f V | slope %.1f mV/V | max |sim-ref| %.1e V"
          % (RL, vo[i10], vo[i15], 1e3 * (vo[i15] - vo[i10]) / 5, e))

print("load regulation at Vin = %g V:" % Vin_)
RLv = np.array([100, 150, 220, 330, 470, 680, 1e3, 2.2e3, 4.7e3, 1e4, 1e5])
vo_ref = np.array([regulator(R) for R in RLv])
i_sim = []
for R in (220.0, 1e3, 4.7e3):                                       # compare 3 loads with the simulator
    ck = build(R); ck.analysis(mode="dc", param="V.Vdc", start=Vin_, stop=Vin_ + 0.1, step=0.1)
    i_sim.append(np.array(ck.run()["Vout"])[0])
for R, v in zip((220.0, 1e3, 4.7e3), i_sim):
    print("  RL = %5.0f ohm : sim %.4f V | ref %.4f V" % (R, v, regulator(R)))
print("  no-load %.3f V ... %.3f V at RL = 100 ohm (zener drops out of regulation)" % (regulator(1e9), regulator(100.0)))

# ripple
RLr = 1e3
rr = build(RLr, "sin"); rr.analysis(mode="tran", start=0, stop=0.06, step=2e-5, adaptive=True, order=2, max_step=1e-4)
r = rr.run(); t, vo = np.array(r["time"]), np.array(r["Vout"])
late = t > 0.03
vo_p2p = vo[late].max() - vo[late].min()
v0 = regulator(RLr); h = 1e-4
rz = 1.0 / ((Iz(-(v0 + h)) * -1 - (Iz(-(v0 - h)) * -1)) / (2 * h))        # dynamic resistance dV/dI
rp = rz * RLr / (rz + RLr)
att = rp / (Rs_ + rp)
print("ripple: Vin = 12 V +- 2 V (100 Hz), RL = %g ohm" % RLr)
print("  zener dynamic resistance at Vout = %.3f V : rz = %.2f ohm | predicted attenuation %.4f -> ripple %.1f mV pp" % (v0, rz, att, 4e3 * att))
print("  simulated output ripple %.1f mV pp (attenuation %.4f), mean %.3f V (ref %.3f V)"
      % (vo_p2p * 1e3, vo_p2p / 4.0, vo[late].mean(), v0))

# ---- figure -------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
cols = ['#2a78d6', '#1baf7a', '#eb6834', '#8a63d2']
def style(ax):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
fig, axs = plt.subplots(1, 3, figsize=(14.5, 4.6), facecolor=surface)
ax = axs[0]; style(ax)
ax.plot(vd, idd * 1e3, color=cols[0], lw=2)
ax.set_xlim(-7, 1); ax.set_ylim(-40, 8)
ax.axvline(-Vz, color=axis_c, ls='--', lw=1); ax.text(-Vz + 0.1, 5, 'Vz = %g V' % Vz, color=ink2)
ax.set_xlabel('V anode-cathode (V)', color=ink2); ax.set_ylabel('I (mA)', color=ink2)
ax.set_title('Zener I(V)', loc='left', color=ink, fontsize=11)
ax = axs[1]; style(ax)
for RL, rv, c in zip(RLs, rf, cols):
    ax.plot(vin, rv["Vout"], color=c, lw=1.8, label='RL = %g Ω' % RL)
ax.set_xlabel('Vin (V)', color=ink2); ax.set_ylabel('Vout (V)', color=ink2)
ax.set_title('Line regulation (Rs = 220 Ω)', loc='left', color=ink, fontsize=11)
ax.legend(frameon=False, labelcolor=ink2, loc='lower right')
ax = axs[2]; style(ax)
ax.plot(t * 1e3, np.array(r["Vin"]) if "Vin" in r else Vin_ + 2 * np.sin(2 * np.pi * 100 * t), color=axis_c, lw=1.3, label='Vin')
ax2 = ax.twinx(); ax2.spines['top'].set_visible(False)
for s in ('left', 'bottom', 'right'): ax2.spines[s].set_color(axis_c)
ax2.plot(t * 1e3, vo * 1e3, color=cols[2], lw=1.8, label='Vout (right, mV)')
ax2.tick_params(colors=ink2); ax.set_xlabel('Time (ms)', color=ink2); ax.set_ylabel('Vin (V)', color=ink2)
ax2.set_ylabel('Vout (mV)', color=ink2)
ax.set_title('Ripple rejection: %.0f mV pp from 4 V pp' % (vo_p2p * 1e3), loc='left', color=ink, fontsize=11)
fig.suptitle('Zener diode (Vz = 5.1 V) and shunt regulator', x=0.01, ha='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("zener_regulator.png", dpi=150, facecolor=surface)
