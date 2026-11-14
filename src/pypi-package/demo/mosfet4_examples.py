#-------------------------------------------------------------------------------
# Name:        MOSFET4: 4-terminal MOSFET, body effect
# Author:      d.fathi
# Created:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# MOSFET4(d, g, s, b): level-1 MOSFET with the body effect
#       Vth = Vth0 + Gamma (sqrt(Phi - vbs) - sqrt(Phi))
# and the two bulk-junction diodes.  Checks:
#   1. drain current against an independent numpy implementation (N and P,
#      random bias points, triode / saturation / reverse operation, body bias)
#   2. threshold voltage measured from sqrt(Id) against Vsb  (body effect)
#   3. output and transfer curves (family in Vsb)
#   4. CMOS inverter: transfer curve and switching threshold Vm, with the bulks
#      on the rails
#   5. N-channel pass transistor: the high level is Vg - Vth(Vsb), not Vg - Vth0

import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import brentq
from pyams.lib import circuit
from pyams.models import DCVoltage, Resistor, Capacitor, MOSFET4, TrapezoidVoltage

Kp, W, L, VT0, LAM, GAM, PHI = 100e-6, 10e-6, 1e-6, 1.0, 0.02, 0.5, 0.7
BETA = Kp * W / L

# ---- independent reference (numpy) --------------------------------------------------------
def ref_id(vd, vg, vs, vb, typ=1, Vt0=VT0, lam=LAM, gam=GAM, phi=PHI, beta=BETA):
    k = typ
    vd, vg, vs, vb = k * vd, k * vg, k * vs, k * vb          # N-channel equivalent
    if vd < vs:                                              # swap source / drain
        vd, vs, sign = vs, vd, -1.0
    else:
        sign = 1.0
    vth = Vt0 + gam * (np.sqrt(max(phi - (vb - vs), 1e-3)) - np.sqrt(phi))
    vov, vds = (vg - vs) - vth, vd - vs
    if vov <= 0:
        i = 0.0
    elif vds < vov:
        i = beta * (vov * vds - vds ** 2 / 2) * (1 + lam * vds)
    else:
        i = beta / 2 * vov ** 2 * (1 + lam * vds)
    return k * sign * i

def bias(typ, vd, vg, vs, vb):
    els = {}
    for nm, node, v in (("Vd", "d", vd), ("Vg", "g", vg), ("Vs", "s", vs), ("Vb", "b", vb)):
        els[nm] = DCVoltage(node, "0"); els[nm].setParams("Vdc=%.12gV" % v)
    M = MOSFET4("d", "g", "s", "b"); M.setParams("Type=%d" % typ); els["M"] = M
    c = circuit(); c.addElements(els); c.setOutPuts("M.Id"); c.analysis(mode="dc")
    return float(c.run()["M.Id"][0])

rng = np.random.default_rng(3)
worst = 0.0
for typ in (1, -1):
    for _ in range(150):
        vd, vg, vs, vb = rng.uniform(-3, 3, 4) * typ
        vb = min(vb, vs + 0.0) if typ == 1 else max(vb, vs)       # bulk not forward biased
        a, r = bias(typ, vd, vg, vs, vb), ref_id(vd, vg, vs, vb, typ)
        worst = max(worst, abs(a - r) / (abs(r) + 1e-9))
print("1) Id against the independent numpy model (300 random biases, N and P, both directions):")
print("   max relative difference %.1e" % worst)

# ---- 2. body effect: Vth from sqrt(Id) ------------------------------------------------------
print("2) body effect (Gamma = %g, Phi = %g V): Vth extracted from sqrt(Id) against Vsb" % (GAM, PHI))
vsb_list = [0.0, 1.0, 2.0, 3.0]
fam = {}
for vsb in vsb_list:
    Vg = DCVoltage("g", "0"); Vg.setParams("Vdc=0V")
    Vd = DCVoltage("d", "0"); Vd.setParams("Vdc=8V")
    Vs = DCVoltage("s", "0"); Vs.setParams("Vdc=%gV" % vsb)
    M = MOSFET4("d", "g", "s", "0"); M.setParams("Lambda=0")             # bulk at 0 V
    c = circuit(); c.addElements({"Vg": Vg, "Vd": Vd, "Vs": Vs, "M": M}); c.setOutPuts("M.Id")
    c.analysis(mode="dc", param="Vg.Vdc", start=vsb, stop=vsb + 4.0, step=0.05)
    r = c.run(); vgs = np.array(r["sweep"]) - vsb; idd = np.array(r["M.Id"])
    fam[vsb] = (vgs, idd)
    m = idd > 0.3 * idd.max()
    slope, icpt = np.polyfit(vgs[m], np.sqrt(idd[m]), 1)
    vth = -icpt / slope
    ref = VT0 + GAM * (np.sqrt(PHI + vsb) - np.sqrt(PHI))
    print("   Vsb = %.0f V : Vth = %.4f V (formula %.4f V) | sqrt(2 Id/beta) slope check %.4f (1.0 expected)"
          % (vsb, vth, ref, slope * np.sqrt(2 / BETA)))

# ---- 3. output curves --------------------------------------------------------------------------
Vgs_list = [1.5, 2.0, 2.5, 3.0]
out = {}
for vgs in Vgs_list:
    Vg = DCVoltage("g", "0"); Vg.setParams("Vdc=%gV" % vgs)
    Vd = DCVoltage("d", "0"); Vd.setParams("Vdc=0V")
    M = MOSFET4("d", "g", "0", "0")
    c = circuit(); c.addElements({"Vg": Vg, "Vd": Vd, "M": M}); c.setOutPuts("M.Id")
    c.analysis(mode="dc", param="Vd.Vdc", start=0, stop=5, step=0.05)
    r = c.run(); out[vgs] = (np.array(r["sweep"]), np.array(r["M.Id"]))

# ---- 4. CMOS inverter ----------------------------------------------------------------------------
VDD = 5.0
def inverter(vin=None, cl=None):
    V = DCVoltage("vdd", "0"); V.setParams("Vdc=%gV" % VDD)
    vi = DCVoltage("in", "0") if vin is None else vin
    N = MOSFET4("out", "in", "0", "0"); N.setParams("Vth0=0.8 Kp=120e-6 W=10e-6 Lambda=0")
    P = MOSFET4("out", "in", "vdd", "vdd"); P.setParams("Type=-1 Vth0=0.9 Kp=60e-6 W=20e-6 Lambda=0")
    els = {"Vdd": V, "Vin": vi, "N": N, "P": P}
    if cl:
        C = Capacitor("out", "0"); C.setParams("C=%g" % cl); els["CL"] = C
    c = circuit(); c.addElements(els); c.setOutPuts("out")
    return c
ck = inverter(); ck.analysis(mode="dc", param="Vin.Vdc", start=0, stop=VDD, step=0.01)
r = ck.run(); vin, vout = np.array(r["sweep"]), np.array(r["out"])
Vm_sim = np.interp(0.0, (vout - vin)[::-1], vin[::-1])
bn, bp = 120e-6 * 10, 60e-6 * 20
rr = np.sqrt(bp / bn)
VtN = 0.8 + GAM * (np.sqrt(PHI) - np.sqrt(PHI))
Vm_ref = (0.8 + rr * (VDD - 0.9)) / (1 + rr)          # saturation of both, Lambda = 0, bulks on the sources
print("4) CMOS inverter (VDD = %g V): switching threshold Vm = %.3f V (formula %.3f V)" % (VDD, Vm_sim, Vm_ref))
print("   Vout(0) = %.3f V, Vout(VDD) = %.4f V; noise margins from the gain = -1 points:"
      % (vout[0], vout[-1]))
g = np.gradient(vout, vin); k1 = np.where(g <= -1)[0]
VIL, VIH = vin[k1[0]], vin[k1[-1]]
VOH, VOL = vout[0], vout[-1]
print("   VIL = %.3f V, VIH = %.3f V -> NML = %.3f V, NMH = %.3f V; max gain %.1f" % (VIL, VIH, VIL - VOL, VOH - VIH, -g.min()))
# transient with a load capacitor
vp = TrapezoidVoltage("in", "0"); vp.setParams("V0=0V V1=5V Td=1n Tr=0.1n Tw=10n Tf=0.1n T=30n")
ct = inverter(vp, 100e-15); ct.analysis(mode="tran", start=0, stop=30e-9, step=0.05e-9, adaptive=True, order=2)
rt = ct.run(); tt, vo = np.array(rt["time"]), np.array(rt["out"])
fall = tt[np.argmax(vo < 2.5)]; rise = tt[(tt > 11e-9) & (vo > 2.5)][0]
print("   transient, CL = 100 fF: Vout %.3f -> %.3f -> %.3f V; delay (50%% of the input edge to 50%% of the output) high-to-low %.3f ns, low-to-high %.3f ns"
      % (vo[0], vo[(tt > 8e-9) & (tt < 11e-9)].min(), vo[-1], (fall - 1.05e-9) * 1e9, (rise - 11.15e-9) * 1e9))

# ---- 5. N-channel pass transistor ---------------------------------------------------------------
Vg_ = 5.0
Vd = DCVoltage("d", "0"); Vd.setParams("Vdc=%gV" % Vg_)
Vgate = DCVoltage("g", "0"); Vgate.setParams("Vdc=%gV" % Vg_)
M = MOSFET4("d", "g", "o", "0"); M.setParams("Lambda=0")
Rl = Resistor("o", "0"); Rl.setParams("R=1e9")
c = circuit(); c.addElements({"Vd": Vd, "Vg": Vgate, "M": M, "Rl": Rl}); c.setOutPuts("o"); c.analysis(mode="dc")
vo4 = float(c.run()["o"][0])
# Vo = Vg - Vth(Vo) - vov, with  beta/2 vov^2 = Vo / Rload  (the 1 Gohm load needs a few mV of overdrive)
def f(v):
    vth = VT0 + GAM * (np.sqrt(PHI + v) - np.sqrt(PHI))
    vov = (Vg_ - v) - vth
    return 0.5 * BETA * max(vov, 0.0) ** 2 - v / 1e9
vref = brentq(f, 0, Vg_)
M3 = MOSFET4("d", "g", "o", "o"); M3.setParams("Lambda=0")
Rl3 = Resistor("o", "0"); Rl3.setParams("R=1e9")
c = circuit(); c.addElements({"Vd": DCVoltage("d", "0"), "Vg": DCVoltage("g", "0"), "M": M3, "Rl": Rl3})
c.elements["Vd"].setParams("Vdc=5V"); c.elements["Vg"].setParams("Vdc=5V")
c.setOutPuts("o"); c.analysis(mode="dc"); vo3 = float(c.run()["o"][0])
print("5) N-channel pass transistor, gate and drain at %g V: output %.4f V with the bulk grounded (%.4f V from beta/2 (Vg - Vo - Vth(Vo))^2 = Vo/Rload), "
      "%.4f V with the bulk tied to the source (Vg - Vth0 = %.1f V)" % (Vg_, vo4, vref, vo3, Vg_ - VT0))

# ---- figure -----------------------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
cols = ['#2a78d6', '#1baf7a', '#eb6834', '#8a63d2']
fig, axs = plt.subplots(2, 2, figsize=(12, 8.2), facecolor=surface)
def style(ax):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
for ax in axs.ravel(): style(ax)
ax = axs[0, 0]
for vg, c in zip(Vgs_list, cols):
    ax.plot(out[vg][0], out[vg][1] * 1e3, color=c, lw=2, label='Vgs = %.1f V' % vg)
ax.set_xlabel('Vds (V)', color=ink2); ax.set_ylabel('Id (mA)', color=ink2); ax.legend(frameon=False, labelcolor=ink2, loc='center right')
ax.set_title('Output curves (bulk at the source)', loc='left', color=ink, fontsize=11)
ax = axs[0, 1]
for vsb, c in zip(vsb_list, cols):
    ax.plot(fam[vsb][0], fam[vsb][1] * 1e3, color=c, lw=2, label='Vsb = %.0f V' % vsb)
ax.set_xlabel('Vgs (V)', color=ink2); ax.set_ylabel('Id (mA)', color=ink2); ax.legend(frameon=False, labelcolor=ink2, loc='upper left')
ax.set_title('Body effect: threshold shifts with Vsb', loc='left', color=ink, fontsize=11)
ax = axs[1, 0]
ax.plot(vin, vout, color=cols[0], lw=2, label='Vout')
ax.plot(vin, vin, color=axis_c, lw=1, ls='--')
ax.plot([Vm_sim], [Vm_sim], 'o', color=cols[2]); ax.annotate('Vm = %.2f V' % Vm_sim, (Vm_sim, Vm_sim), xytext=(Vm_sim + 0.4, Vm_sim + 0.8), color=ink2)
ax.set_xlabel('Vin (V)', color=ink2); ax.set_ylabel('Vout (V)', color=ink2)
ax.set_title('CMOS inverter transfer curve', loc='left', color=ink, fontsize=11)
ax = axs[1, 1]
ax.plot(tt * 1e9, vo, color=cols[0], lw=2, label='Vout')
vin_t = np.interp(tt, [0, 1e-9, 1.1e-9, 11.1e-9, 11.2e-9, 30e-9], [0, 0, 5, 5, 0, 0])
ax.plot(tt * 1e9, vin_t, color=axis_c, lw=1.4, label='Vin')
ax.set_xlabel('Time (ns)', color=ink2); ax.set_ylabel('Voltage (V)', color=ink2); ax.legend(frameon=False, labelcolor=ink2)
ax.set_title('Inverter, CL = 100 fF', loc='left', color=ink, fontsize=11)
fig.tight_layout(); fig.savefig("mosfet4_examples.png", dpi=150, facecolor=surface)
