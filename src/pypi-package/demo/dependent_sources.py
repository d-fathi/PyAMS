#-------------------------------------------------------------------------------
# Name:        Dependent (controlled) sources: VCVS, CCVS, VCCS, CCCS
# Created:     20/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
#   VCVS(p, n, cp, cn)  v(p,n) = Gain * v(cp,cn)        (SPICE E)
#   VCCS(p, n, cp, cn)  i(p->n) = Gm   * v(cp,cn)       (SPICE G)
#   CCVS(p, n, cp, cn)  v(p,n) = Rm    * i(cp->cn)      (SPICE H)
#   CCCS(p, n, cp, cn)  i(p->n) = Gain * i(cp->cn)      (SPICE F)
# For the current-controlled sources (cp, cn) is a built-in 0 V ammeter: put it
# IN SERIES with the branch that carries the controlling current.
#
# Five checks, each against a formula:
#   1. VCVS as an op-amp with finite gain (non-inverting amplifier)
#   2. VCCS gyrator: a capacitor looks like an inductor  L = C / gm^2
#   3. CCCS + VCVS: ideal transformer (voltage ratio n, current ratio 1/n)
#   4. CCVS: transimpedance amplifier  Vout = Rm * Iin  (zero input resistance)
#   5. hybrid-pi small-signal amplifier: VCCS (gm vpi) and CCCS (beta ib) are the same

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import (DCVoltage, ACVoltage, ACCurrent, Resistor, Capacitor, Inductor,
                          VCVS, VCCS, CCVS, CCCS)

def dc(els, *out):
    c = circuit(); c.addElements(els); c.setOutPuts(*out); c.analysis(mode="dc")
    r = c.run(); return {k: float(r[k][0]) for k in out}

# ---- 1. VCVS: op-amp with finite gain, non-inverting amplifier ----------------------------
R1, R2, A = 1e3, 9e3, 1e5
print("1) VCVS as op-amp (Gain = %g), non-inverting amplifier 1 + R2/R1 = %g" % (A, 1 + R2 / R1))
Vin = DCVoltage("in", "0"); Vin.setParams("Vdc=0.5V")
U = VCVS("out", "0", "in", "m"); U.setParams("Gain=%g" % A)        # v(out) = A (v(in) - v(m))
r1 = Resistor("m", "0"); r1.setParams("R=%gΩ" % R1)
r2 = Resistor("out", "m"); r2.setParams("R=%gΩ" % R2)
v = dc({"Vin": Vin, "U": U, "R1": r1, "R2": r2}, "out", "m")
ref = 0.5 * A / (1 + A * R1 / (R1 + R2))
print("   Vin = 0.5 V : Vout = %.6f V | formula A/(1 + A R1/(R1+R2)) Vin = %.6f V | ideal %.1f V | v(-) = %.6f V"
      % (v["out"], ref, 0.5 * (1 + R2 / R1), v["m"]))

# ---- 2. gyrator: two VCCS and a capacitor = inductor --------------------------------------
gm, Cg, Rp = 1e-3, 1e-6, 1e7
L_eq = Cg / gm ** 2
print("2) gyrator: gm = %g mS, C = %g uF -> L = C/gm^2 = %g H" % (gm * 1e3, Cg * 1e6, L_eq))
def gyr_input(use_gyrator):
    I = ACCurrent("0", "a")                      # 1 A into node a : v(a) = Zin
    if use_gyrator:
        G1 = VCCS("a", "0", "b", "0"); G1.setParams("Gm=%g" % gm)     # takes gm v(b) out of port 1
        G2 = VCCS("b", "0", "a", "0"); G2.setParams("Gm=%g" % -gm)    # injects gm v(a) into port 2
        C = Capacitor("b", "0"); C.setParams("C=%g" % Cg)
        Rb = Resistor("b", "0"); Rb.setParams("R=%g" % Rp)            # tiny loss, gives node b a dc path
        Rd = Resistor("a", "0"); Rd.setParams("R=1e9")
        els = {"I": I, "G1": G1, "G2": G2, "C": C, "Rb": Rb, "Rd": Rd}
    else:
        L = Inductor("a", "0"); L.setParams("L=%g" % L_eq)
        els = {"I": I, "L": L}
    c = circuit(); c.addElements(els); c.setOutPuts("a")
    c.analysis(mode="ac", start=1, stop=1e4, step=20); return c.run()
rg, rl = gyr_input(True), gyr_input(False)
f, Zg = rg["freq"], rg["a"]
Zref = 1j * 2 * np.pi * f * L_eq + 0                      # ideal inductor
Zexact = (1j * 2 * np.pi * f * Cg + 1 / Rp) / gm ** 2      # gyrator with the loss resistor
print("   |Zin| = w L : max relative difference %.1e at 1 Hz, where the 10 Mohm loss matters (formula with the loss: %.1e); phase %.2f deg at 100 Hz"
      % (np.max(np.abs(Zg - Zref) / np.abs(Zref)), np.max(np.abs(Zg - Zexact) / np.abs(Zexact)),
         np.degrees(np.angle(Zg[np.argmin(np.abs(f - 100))]))))
# tank: gyrator inductor || C || R against a real inductor
def tank(use_gyrator):
    I = ACCurrent("0", "a"); Ct = Capacitor("a", "0"); Ct.setParams("C=1uF"); Rt = Resistor("a", "0"); Rt.setParams("R=10kΩ")
    if use_gyrator:
        G1 = VCCS("a", "0", "b", "0"); G1.setParams("Gm=%g" % gm)
        G2 = VCCS("b", "0", "a", "0"); G2.setParams("Gm=%g" % -gm)
        C = Capacitor("b", "0"); C.setParams("C=%g" % Cg)
        Rb = Resistor("b", "0"); Rb.setParams("R=%g" % Rp)
        els = {"I": I, "Ct": Ct, "Rt": Rt, "G1": G1, "G2": G2, "C": C, "Rb": Rb}
    else:
        L = Inductor("a", "0"); L.setParams("L=%g" % L_eq); els = {"I": I, "Ct": Ct, "Rt": Rt, "L": L}
    c = circuit(); c.addElements(els); c.setOutPuts("a"); c.analysis(mode="ac", start=10, stop=1e3, step=200)
    return c.run()
tg, tl = tank(True), tank(False)
ft = tg["freq"]
print("   parallel tank (C = 1 uF, R = 10 k): peak at %.2f Hz with the gyrator, %.2f Hz with a real inductor (1/(2 pi sqrt(LC)) = %.2f Hz); max difference %.2e"
      % (ft[np.argmax(np.abs(tg["a"]))], ft[np.argmax(np.abs(tl["a"]))], 1 / (2 * np.pi * np.sqrt(L_eq * 1e-6)),
         np.max(np.abs(tg["a"] - tl["a"]) / np.abs(tl["a"]))))

# ---- 3. ideal transformer: VCVS (secondary voltage) + CCCS (primary current) -----------------
n, Rs_, RL_ = 0.5, 100.0, 100.0
Vs = DCVoltage("src", "0"); Vs.setParams("Vdc=10V")
Rs = Resistor("src", "p"); Rs.setParams("R=%gΩ" % Rs_)
E = VCVS("s", "0", "p", "0"); E.setParams("Gain=%g" % n)            # v2 = n v1
F = CCCS("p", "0", "s", "l"); F.setParams("Gain=%g" % n)            # i1 = n i2   (i2 = load current s -> l)
RL = Resistor("l", "0"); RL.setParams("R=%gΩ" % RL_)
v = dc({"Vs": Vs, "Rs": Rs, "E": E, "F": F, "RL": RL}, "p", "s", "l")
Rr = RL_ / n ** 2
print("3) ideal transformer n = %g, Rs = %g ohm, RL = %g ohm (seen from the primary: RL/n^2 = %g ohm)" % (n, Rs_, RL_, Rr))
print("   V1 = %.4f V (expected %.4f) | V2 = %.4f V (expected %.4f) | power in/out: %.4f / %.4f W"
      % (v["p"], 10 * Rr / (Rs_ + Rr), v["s"], n * 10 * Rr / (Rs_ + Rr),
         v["p"] * (10 - v["p"]) / Rs_, v["l"] ** 2 / RL_))

# ---- 4. CCVS: transimpedance amplifier -----------------------------------------------------
Rm, Rsrc = 5e3, 1e3
I = ACCurrent("0", "x"); I.setParams("Iac=1mA")                      # Norton source: 1 mA with 1 k in parallel
Rg = Resistor("x", "0"); Rg.setParams("R=%gΩ" % Rsrc)
H = CCVS("out", "0", "x", "0"); H.setParams("Rm=%g" % Rm)            # ammeter between x and ground
Rl = Resistor("out", "0"); Rl.setParams("R=2kΩ")
c = circuit(); c.addElements({"I": I, "Rg": Rg, "H": H, "Rl": Rl}); c.setOutPuts("out", "x", "H.Ic")
c.analysis(mode="ac", start=10, stop=1e3, step=5); r4 = c.run()
print("4) CCVS transimpedance amplifier (Rm = %g ohm, source 1 mA || %g ohm)" % (Rm, Rsrc))
print("   Vout/Iin = %.3f ohm (Rm), v(x) = %.2e V (the ammeter is a short circuit), control current %.4f mA of 1 mA"
      % (abs(r4["out"][0]) / 1e-3, abs(r4["x"][0]), abs(r4["H.Ic"][0]) * 1e3))

# ---- 5. hybrid-pi: gm*vpi = beta*ib ---------------------------------------------------------
gm5, beta = 96.7e-3, 100.0
rpi = beta / gm5
Rb, RC, RLo, Rsg = 14.7e3, 2.2e3, 10e3, 600.0
def hybrid(mode):
    Vs = ACVoltage("s", "0"); Rg = Resistor("s", "in"); Rg.setParams("R=%gΩ" % Rsg)
    Rbb = Resistor("in", "0"); Rbb.setParams("R=%gΩ" % Rb)
    rc = Resistor("c", "0"); rc.setParams("R=%g" % RC); rl = Resistor("c", "0"); rl.setParams("R=%g" % RLo)
    els = {"Vs": Vs, "Rg": Rg, "Rb": Rbb, "rc": rc, "rl": rl}
    if mode == "vccs":
        els["G"] = VCCS("c", "0", "in", "0"); els["G"].setParams("Gm=%g" % gm5)       # collector current gm v(in): taken out of c
        els["rp"] = Resistor("in", "0"); els["rp"].setParams("R=%g" % rpi)
    else:
        els["rp"] = Resistor("in", "sens"); els["rp"].setParams("R=%g" % rpi)
        els["F"] = CCCS("c", "0", "sens", "0"); els["F"].setParams("Gain=%g" % beta)    # beta ib (ib flows through r_pi and the ammeter)
    ck = circuit(); ck.addElements(els); ck.setOutPuts("c"); ck.analysis(mode="ac", start=1e3, stop=1e4, step=1)
    return ck.run()["c"][0]
Rin = 1 / (1 / Rb + 1 / rpi)
Av = -(Rin / (Rsg + Rin)) * gm5 * (RC * RLo / (RC + RLo))
print("5) hybrid-pi (gm = %.1f mS, r_pi = %.0f ohm): gain with VCCS %.3f, with CCCS %.3f | formula %.3f"
      % (gm5 * 1e3, rpi, hybrid("vccs").real, hybrid("ccs").real, Av))

# ---- figure --------------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, axs = plt.subplots(1, 2, figsize=(12, 4.6), facecolor=surface)
def style(ax):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8, which='both'); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2); ax.set_xscale('log'); ax.set_yscale('log')
for ax in axs: style(ax)
ax = axs[0]
ax.plot(f, np.abs(Zg), color='#2a78d6', lw=2, label='gyrator: |Zin|')
ax.plot(f[::12], 2 * np.pi * f[::12] * L_eq, 'o', color='#eb6834', ms=4, label='ω L, L = 1 H')
ax.set_xlabel('Frequency (Hz)', color=ink2); ax.set_ylabel('|Zin| (Ω)', color=ink2)
ax.set_title('Two VCCS and a 1 µF capacitor = 1 H inductor', loc='left', color=ink, fontsize=11)
ax.legend(frameon=False, labelcolor=ink2, loc='upper left')
ax = axs[1]
ax.plot(ft, np.abs(tg["a"]), color='#2a78d6', lw=2, label='tank with gyrator')
ax.plot(ft[::10], np.abs(tl["a"])[::10], 'o', color='#eb6834', ms=4, label='tank with Inductor')
ax.set_xlabel('Frequency (Hz)', color=ink2); ax.set_ylabel('|V| for 1 A (Ω)', color=ink2)
ax.set_title('Parallel LC tank: f0 = 159 Hz', loc='left', color=ink, fontsize=11)
ax.legend(frameon=False, labelcolor=ink2, loc='lower center')
fig.tight_layout(); fig.savefig("dependent_sources.png", dpi=150, facecolor=surface)
