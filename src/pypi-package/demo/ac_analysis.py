#-------------------------------------------------------------------------------
# Name:        AC analysis (small-signal frequency response)
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# analysis(mode="ac", start=f1, stop=f2, step=points_per_decade) solves the DC
# operating point, linearises the circuit around it and solves the complex
# system at every frequency.  The ACVoltage source (Vac = 1 V) gives the phasor
# of each output directly as the transfer function.
#   1. series RLC band-pass, family in R with sweep()      (analytic reference)
#   2. common-emitter BJT amplifier: bias point -> gm, midband gain and corner
#      frequencies, checked against hybrid-pi formulas and against a transient
#      run with a small sine (the full non-linear model)
#   3. op-amp inverting amplifier with a single-pole open loop (gain-bandwidth)

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import (ACVoltage, SinVoltage, DCVoltage, Resistor, Capacitor,
                          Inductor, BJT, OpAmp)

db = lambda z: 20 * np.log10(np.abs(z))

# ---- 1. series RLC, output across the resistor (band-pass) -----------------------------
L_, C_ = 1e-3, 1e-6
V = ACVoltage("in", "0")
L = Inductor("in", "a");  L.setParams("L=%gH" % L_)
C = Capacitor("a", "b");  C.setParams("C=%gF" % C_)
R = Resistor("b", "0");   R.setParams("R=10Ω")
rlc = circuit(); rlc.addElements({"V": V, "L": L, "C": C, "R": R}); rlc.setOutPuts("b")
Rs = [2.0, 10.0, 50.0]
rlc.analysis(mode="ac", start=100, stop=1e5, step=400)
rlc.sweep(param="R.R", list=Rs)
runs = rlc.run()
f0 = 1 / (2 * np.pi * np.sqrt(L_ * C_))
print("1) series RLC band-pass: f0 = %.1f Hz" % f0)
for Rv, r in zip(Rs, runs):
    f, H = r["freq"], r["b"]
    w = 2 * np.pi * f
    Hr = Rv / (Rv + 1j * w * L_ + 1 / (1j * w * C_))
    k = np.argmax(np.abs(H)); Q = np.sqrt(L_ / C_) / Rv
    g = np.abs(H) / np.abs(H[k])
    lo = np.interp(1 / np.sqrt(2), g[:k + 1], f[:k + 1])               # -3 dB edges, interpolated
    hi = np.interp(1 / np.sqrt(2), g[k:][::-1], f[k:][::-1])
    print("   R = %4.0f ohm : max |sim-analytic| = %.1e | peak gain %.4f | -3 dB band %.0f..%.0f Hz, Q(sim) = %.2f vs %.2f"
          % (Rv, np.abs(H - Hr).max(), np.abs(H[k]), lo, hi, f0 / (hi - lo), Q))
rlc.plot("ac_rlc.png", show=False)

# ---- 2. common-emitter amplifier --------------------------------------------------------
Vcc, R1, R2, RC, RE, RL, Rsrc = 12.0, 82e3, 18e3, 2.2e3, 470.0, 10e3, 600.0
Cin, Cout, CE = 1e-6, 10e-6, 100e-6

def ce_amp(src):
    Vs = DCVoltage("vcc", "0");    Vs.setParams("Vdc=%gV" % Vcc)
    Rg = Resistor("s", "in");      Rg.setParams("R=%gΩ" % Rsrc)
    ci = Capacitor("in", "b");     ci.setParams("C=%gF" % Cin)
    r1 = Resistor("vcc", "b");     r1.setParams("R=%gΩ" % R1)
    r2 = Resistor("b", "0");       r2.setParams("R=%gΩ" % R2)
    rc = Resistor("vcc", "c");     rc.setParams("R=%gΩ" % RC)
    re = Resistor("e", "0");       re.setParams("R=%gΩ" % RE)
    ce = Capacitor("e", "0");      ce.setParams("C=%gF" % CE)
    q = BJT("c", "b", "e")
    co = Capacitor("c", "out");    co.setParams("C=%gF" % Cout)
    rl = Resistor("out", "0");     rl.setParams("R=%gΩ" % RL)
    k = circuit()
    k.addElements({"Vcc": Vs, "Vs": src, "Rg": Rg, "Cin": ci, "R1": r1, "R2": r2, "RC": rc,
                   "RE": re, "CE": ce, "Q": q, "Cout": co, "RL": rl})
    return k

src = ACVoltage("s", "0")
amp = ce_amp(src); amp.setOutPuts("out", "b", "c", "e")
amp.analysis(mode="ac", start=1, stop=1e8, step=20)
ra = amp.run()
f, Hout = ra["freq"], ra["out"]

# DC operating point of the same circuit (a one-point DC analysis)
dc = ce_amp(DCVoltage("s", "0")); dc.setOutPuts("b", "c", "e", "out")
dc.analysis(mode="dc"); rd = dc.run()
Vb, Vc, Ve = rd["b"][0], rd["c"][0], rd["e"][0]
Ic = (Vcc - Vc) / RC                                   # no dc current in RL (Cout blocks)
gm = Ic / 0.025                                        # BJT model: Vt = 25 mV
rpi = 100.0 / gm
Rb = 1 / (1 / R1 + 1 / R2)
Rin = 1 / (1 / Rb + 1 / rpi)
Av_mid = -(Rin / (Rsrc + Rin)) * gm * (RC * RL / (RC + RL))
i_mid = np.argmin(np.abs(f - 1e4))
print("2) common-emitter amplifier: Vb = %.3f V, Ve = %.3f V, Vc = %.3f V, Ic = %.3f mA, gm = %.1f mS, r_pi = %.0f ohm"
      % (Vb, Ve, Vc, Ic * 1e3, gm * 1e3, rpi))
print("   midband gain (10 kHz): sim %.2f (%.2f dB, phase %.1f deg) | hybrid-pi %.2f (%.2f dB)"
      % (Hout[i_mid].real, db(Hout[i_mid]), np.degrees(np.angle(Hout[i_mid])), Av_mid, db(Av_mid)))
mid = np.abs(Hout[i_mid])
def corner(sel):
    g = np.abs(Hout[sel]) / mid
    ff = f[sel]
    return np.interp(1 / np.sqrt(2), g if g[0] < g[-1] else g[::-1], ff if g[0] < g[-1] else ff[::-1])
f_lo = corner(f < 1e4); f_hi = corner(f > 1e4)
print("   -3 dB corners: low %.1f Hz, high %.2f MHz  (mid %.2f dB, band %.0f dB..)" % (f_lo, f_hi / 1e6, db(mid), db(mid) - 3))

# check against the full non-linear transient: 1 mV sine at 10 kHz and at 100 Hz
for fx in (100.0, 1e4):
    sv = SinVoltage("s", "0"); sv.setParams("Va=1mV Fr=%gHz" % fx)
    tr = ce_amp(sv); tr.setOutPuts("out")
    T = 1 / fx
    tr.analysis(mode="tran", start=0, stop=25 * T if fx > 1e3 else 12 * T, step=T / 100, adaptive=True, order=2)
    rt = tr.run(); t, vo = rt["time"], rt["out"]
    m = t > t[-1] - 2 * T
    amp_t = 0.5 * (vo[m].max() - vo[m].min()) / 1e-3
    ia = np.argmin(np.abs(f - fx))
    Hx = np.interp(fx, f, np.abs(Hout))
    print("   transient 1 mV @ %6.0f Hz : gain %.2f | AC analysis %.2f" % (fx, amp_t, Hx))

# ---- 3. op-amp inverting amplifier: gain-bandwidth -----------------------------------
A0, tau = 1e5, 1.0 / (2 * np.pi * 100.0)                # open-loop pole at 100 Hz -> GBW = 10 MHz
Ri, Rf = 1e3, 10e3
Vin = ACVoltage("in", "0")
ri = Resistor("in", "n");  ri.setParams("R=%gΩ" % Ri)
rf = Resistor("n", "out"); rf.setParams("R=%gΩ" % Rf)
U = OpAmp("0", "n", "out"); U.setParams("A=%g Tau=%g Ro=1Ω" % (A0, tau))   # non-inverting input to ground
op = circuit(); op.addElements({"Vin": Vin, "Ri": ri, "Rf": rf, "U": U}); op.setOutPuts("out")
op.analysis(mode="ac", start=10, stop=1e8, step=20)
ro = op.run(); fo, Ho = ro["freq"], ro["out"]
wo = 2 * np.pi * fo
Aol = A0 / (1 + 1j * wo * tau)
Hr = -Aol * Rf / (Ri + Rf) / (1 + Aol * Ri / (Ri + Rf))
print("3) op-amp inverting amplifier (R2/R1 = %g): max |sim - analytic| = %.1e" % (Rf / Ri, np.abs(Ho - Hr).max()))
fc = np.interp(db(Ho[0]) - 3, db(Ho)[::-1], fo[::-1])
print("   DC gain %.3f dB (ideal %.3f dB); -3 dB at %.0f kHz (GBW/(1+R2/R1) = %.0f kHz)"
      % (db(Ho[0]), db(Rf / Ri), fc / 1e3, 10e6 / (1 + Rf / Ri) / 1e3))

# ---- figure ---------------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
cols = ['#2a78d6', '#eb6834', '#1baf7a']
fig, axs = plt.subplots(2, 2, figsize=(12.5, 7.5), facecolor=surface, sharex='col',
                        gridspec_kw={'height_ratios': [2, 1]})
def style(ax):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8, which='both'); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2); ax.set_xscale('log')
for ax in axs.ravel(): style(ax)
ax = axs[0, 0]
for Rv, r, c in zip(Rs, runs, cols):
    ax.plot(r["freq"], db(r["b"]), color=c, lw=1.8, label='R = %g Ω' % Rv)
    axs[1, 0].plot(r["freq"], np.degrees(np.angle(r["b"])), color=c, lw=1.8)
ax.set_ylim(-40, 3); ax.legend(frameon=False, labelcolor=ink2, loc="upper left")
ax.set_title('Series RLC band-pass (f0 = %.0f Hz)' % f0, loc='left', color=ink, fontsize=11)
ax = axs[0, 1]
ax.plot(f, db(Hout), color=cols[0], lw=2, label='CE amplifier')
ax.plot(fo, db(Ho), color=cols[1], lw=2, label='op-amp, R2/R1 = 10')
ax.axhline(db(Av_mid), color=axis_c, ls='--', lw=1)
ax.set_ylim(-20, 45); ax.legend(frameon=False, labelcolor=ink2, loc='lower center')
ax.set_title('CE amplifier and inverting op-amp', loc='left', color=ink, fontsize=11)
axs[1, 1].plot(f, np.degrees(np.unwrap(np.angle(Hout))), color=cols[0], lw=1.8)
axs[1, 1].plot(fo, np.degrees(np.unwrap(np.angle(Ho))), color=cols[1], lw=1.8)
for a in axs[0]: a.set_ylabel('Magnitude (dB)', color=ink2)
for a in axs[1]: a.set_ylabel('Phase (deg)', color=ink2); a.set_xlabel('Frequency (Hz)', color=ink2)
fig.tight_layout(); fig.savefig("ac_analysis.png", dpi=150, facecolor=surface)
