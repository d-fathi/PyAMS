#-------------------------------------------------------------------------------
# Name:        Elliptic (Cauer) RLC low-pass filter
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
# Passive doubly-terminated LC ladder with an elliptic (Cauer) response:
# equal ripple in the passband AND in the stopband, and transmission zeros
# (infinite attenuation) at finite frequencies, made by parallel L-C branches
# in the series arms.
#
#   Vin -- Rs --+-----[L2 || C2]-----+-----[L4 || C4]-----+---- Vout
#               |                    |                    |
#              C1                   C3                   C5      RL
#               |                    |                    |
#              gnd                  gnd                  gnd
#
# Design (done here, from scratch, with no filter-design tables):
#   1. scipy gives the prototype |H(jw)|^2 = 1 / (1 + eps^2 R_n^2(w)).
#   2. With lossless ladder and Rs = RL:  rho(s) rho(-s) = 1 - H(s) H(-s).
#      The reflection zeros are on the jw axis (the ripple minima); the
#      polynomial N(s) of rho = N/A is built from them.
#   3. Zin(s) = (A + N) / (A - N) (the sign that makes every element positive),
#      then a continued-fraction (Cauer) expansion removes, in turn, a shunt C
#      such that the rest has a pole at a transmission zero, and that pole as a
#      parallel L-C branch.
# The circuit is then simulated with the AC analysis and compared with scipy's
# response; a transient run with a sine checks one passband and one stopband
# point.

import itertools
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
from pyams.lib import circuit
from pyams.models import ACVoltage, SinVoltage, Resistor, Capacitor, Inductor

ORDER, RP, RS_DB = 5, 0.5, 50.0              # order, passband ripple (dB), stopband attenuation (dB)
R0, FC = 1e3, 5e3                            # termination (ohm), passband edge (Hz)


def elliptic_ladder(n=ORDER, rp=RP, rs=RS_DB):
    """Normalised ladder (R = 1, wc = 1) of an odd-order elliptic low-pass:
    returns (C1, (L2, C2), C3, (L4, C4), C5, ...) and the zero frequencies."""
    z, _, _ = signal.ellip(n, rp, rs, 1.0, analog=True, output='zpk')
    b, a = signal.ellip(n, rp, rs, 1.0, analog=True)
    A, B = np.poly1d(a), np.poly1d(b)
    mirror = lambda P: np.poly1d([c * (-1) ** (len(P.coeffs) - 1 - i)
                                  for i, c in enumerate(P.coeffs)])           # P(-s)
    P = A * mirror(A) - B * mirror(B)                                       # = N(s) N(-s)
    r = np.roots(P.coeffs)
    wr = np.sort(np.abs(r[np.abs(r) > 1e-4].imag))
    wr = [float(np.mean(wr[i:i + 4])) for i in range(0, len(wr), 4)]         # each ripple zero: +-jw, double
    N = np.poly1d([1.0, 0.0])
    for w in wr:
        N = N * np.poly1d([1.0, 0.0, w * w])
    N = N * np.sqrt(-P.coeffs[0])
    wz = sorted({abs(x.imag) for x in z if abs(x.imag) > 1e-9})
    wz = sorted({round(w, 9) for w in wz})
    for sgn in (-1, +1):
        Yn, Yd = A - sgn * N, A + sgn * N                                    # input admittance
        for order in itertools.permutations(wz):
            out = []
            ok = True
            Q_ = Yn, Yd
            for w in order:
                Yn_, Yd_ = Q_
                s0 = 1j * w
                C = (Yn_(s0) / Yd_(s0) / s0).real                           # shunt C: rest has a pole at jw
                num = Yn_ - np.poly1d([C, 0]) * Yd_
                Q, _ = np.polydiv(num.coeffs, [1, 0, w * w]); Q = np.poly1d(Q)
                k = (Yd_(s0) / (Q(s0) * s0)).real                           # residue of the pole at jw
                Nn = Yd_ - np.poly1d([k, 0]) * Q
                R, _ = np.polydiv(Nn.coeffs, [1, 0, w * w]); R = np.poly1d(R)
                C2, L2 = 1 / k, k / (w * w)
                if min(C, C2, L2) <= 0:
                    ok = False
                    break
                out += [C, (L2, C2)]
                Q_ = Q, R
            if ok:
                Yn_, Yd_ = Q_                                               # rest = C_last s + 1 (the load)
                C_last = Yn_.coeffs[0] / Yd_.coeffs[-1]
                if C_last > 0 and abs(Yn_.coeffs[-1] / Yd_.coeffs[-1] - 1) < 1e-2:
                    return out + [C_last], list(order)
    raise RuntimeError("no positive ladder found")


vals, wz = elliptic_ladder()
wc = 2 * np.pi * FC
C1n, (L2n, C2n), C3n, (L4n, C4n), C5n = vals
Cs = lambda c: c / (R0 * wc)
Ls = lambda l: l * R0 / wc
C1, C3, C5 = Cs(C1n), Cs(C3n), Cs(C5n)
L2, C2, L4, C4 = Ls(L2n), Cs(C2n), Ls(L4n), Cs(C4n)
print("elliptic low-pass, order %d, %.1f dB ripple, %.0f dB stopband, fc = %.0f Hz, R = %.0f ohm" % (ORDER, RP, RS_DB, FC, R0))
print("  normalised: C1=%.4f  L2=%.4f C2=%.4f  C3=%.4f  L4=%.4f C4=%.4f  C5=%.4f" % (C1n, L2n, C2n, C3n, L4n, C4n, C5n))
print("  C1 = %.2f nF | L2 = %.3f mH, C2 = %.2f nF | C3 = %.2f nF | L4 = %.3f mH, C4 = %.2f nF | C5 = %.2f nF"
      % (C1 * 1e9, L2 * 1e3, C2 * 1e9, C3 * 1e9, L4 * 1e3, C4 * 1e9, C5 * 1e9))
fz = [FC * w for w in wz]
print("  tank resonances 1/(2 pi sqrt(L C)): %.1f Hz, %.1f Hz | transmission zeros of the prototype: %.1f, %.1f Hz"
      % (1 / (2 * np.pi * np.sqrt(L2 * C2)), 1 / (2 * np.pi * np.sqrt(L4 * C4)), fz[0], fz[1]))


def build(Q=None):
    """The ladder; Q = quality factor of the inductors at fc (series resistance), None = ideal."""
    Vs = ACVoltage("in", "0")
    els = {"Vs": Vs}
    els["Rs"] = Resistor("in", "n1");  els["Rs"].setParams("R=%gΩ" % R0)
    els["C1"] = Capacitor("n1", "0");  els["C1"].setParams("C=%gF" % C1)
    els["C2"] = Capacitor("n1", "n2"); els["C2"].setParams("C=%gF" % C2)
    els["C3"] = Capacitor("n2", "0");  els["C3"].setParams("C=%gF" % C3)
    els["C4"] = Capacitor("n2", "out"); els["C4"].setParams("C=%gF" % C4)
    els["C5"] = Capacitor("out", "0"); els["C5"].setParams("C=%gF" % C5)
    els["RL"] = Resistor("out", "0");  els["RL"].setParams("R=%gΩ" % R0)
    for nm, (a, b, L) in {"L2": ("n1", "n2", L2), "L4": ("n2", "out", L4)}.items():
        if Q is None:
            els[nm] = Inductor(a, b); els[nm].setParams("L=%gH" % L)
        else:
            els[nm] = Inductor(a, "m_" + nm); els[nm].setParams("L=%gH" % L)
            els["r" + nm] = Resistor("m_" + nm, b); els["r" + nm].setParams("R=%gΩ" % (wc * L / Q))
    ck = circuit(); ck.addElements(els); ck.setOutPuts("out")
    return ck


ck = build()
ck.analysis(mode="ac", start=100, stop=1e5, step=500)
ra = ck.run(); f, H = ra["freq"], 2 * ra["out"]                       # 2 Vout/Vin: unity at dc
b, a = signal.ellip(ORDER, RP, RS_DB, 1.0, analog=True)
_, Hs = signal.freqs(b, a, 2 * np.pi * f / wc)
err = np.max(np.abs(H - Hs))
print("response against scipy ellip: max |H_sim - H_scipy| = %.1e (unity at dc)" % err)

pb = f <= FC
rip = -20 * np.log10(np.abs(H[pb]))
print("  passband: loss between %.3f and %.3f dB (design %.1f dB)" % (rip.min(), rip.max(), RP))
att = -20 * np.log10(np.abs(H))
att_s = -20 * np.log10(np.abs(Hs))
fs = f[np.argmax((att_s >= RS_DB - 1e-3) & (f > FC))]              # first frequency with the full 50 dB
print("  stopband edge fs = %.0f Hz (selectivity fs/fc = %.3f): attenuation above fs is never below %.2f dB (design %.0f dB)"
      % (fs, fs / FC, att[f >= fs].min(), RS_DB))
zmin = [f[(f > lo) & (f < hi)][np.argmin(np.abs(H[(f > lo) & (f < hi)]))] for lo, hi in ((6e3, 9e3), (10e3, 14e3))]
print("  transmission zeros in the circuit response: %.0f Hz and %.0f Hz (notch depth %.0f dB, %.0f dB)"
      % (zmin[0], zmin[1], att[f == zmin[0]][0], att[f == zmin[1]][0]))

# lossy inductors
Qs = [200.0, 50.0]
rq = []
for Q in Qs:
    ckq = build(Q); ckq.analysis(mode="ac", start=100, stop=1e5, step=500); rq.append(ckq.run())
    Hq = 2 * rq[-1]["out"]
    print("  inductor Q = %3.0f at fc : dc gain %.3f dB, passband loss up to %.2f dB, deepest notch %.0f dB"
          % (Q, 20 * np.log10(abs(Hq[0])), np.max(-20 * np.log10(np.abs(Hq[f <= FC]))), np.max(-20 * np.log10(np.abs(Hq)))))

# transient check: sine in the passband and between the notches
for fx in (3e3, 9e3):
    Vt = SinVoltage("in", "0"); Vt.setParams("Va=1V Fr=%gHz" % fx)
    t_ = build(); t_.elements["Vs"] = Vt
    t_.setOutPuts("out")
    T = 1 / fx
    t_.analysis(mode="tran", start=0, stop=12e-3, step=T / 80, adaptive=True, order=2, max_step=T / 40)
    rt = t_.run(); tt, vo = rt["time"], rt["out"]
    m = tt > tt[-1] - 3 * T
    amp = 0.5 * (vo[m].max() - vo[m].min())
    print("  transient sine 1 V at %.0f kHz : output amplitude %.4f V | AC analysis %.4f V (twice : %.4f)"
          % (fx / 1e3, amp, np.interp(fx, f, np.abs(H)) / 2, np.interp(fx, f, np.abs(H))))

# group delay
ph = np.unwrap(np.angle(H))
gd = -np.gradient(ph, 2 * np.pi * f)

# ---- figure ----------------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
def style(ax, logx=True):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8, which='both' if logx else 'major'); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
fig, axs = plt.subplots(1, 3, figsize=(15, 4.8), facecolor=surface)
dbf = lambda z: 20 * np.log10(np.maximum(np.abs(z), 1e-12))
ax = axs[0]; style(ax); ax.set_xscale('log')
ax.plot(f, dbf(H), color='#2a78d6', lw=2, label='PyAMS (ideal L, C)')
ax.plot(f[::25], dbf(Hs)[::25], 'o', color='#eb6834', ms=4, label='scipy ellip')
ax.plot(f, dbf(2 * rq[1]["out"]), color='#1baf7a', lw=1.3, label='inductor Q = 50')
ax.axvline(FC, color=axis_c, ls='--', lw=1)
ax.set_ylim(-110, 5); ax.set_xlabel('Frequency (Hz)', color=ink2); ax.set_ylabel('Magnitude (dB)', color=ink2)
ax.set_title('Elliptic low-pass, order 5', loc='left', color=ink, fontsize=11)
ax.legend(frameon=False, labelcolor=ink2, loc='lower left', fontsize=9)
ax = axs[1]; style(ax, False)
m = f <= 1.02 * FC
ax.plot(f[m], dbf(H)[m], color='#2a78d6', lw=2)
ax.plot(f[m], dbf(2 * rq[0]["out"])[m], color='#1baf7a', lw=1.3, label='inductor Q = 200')
ax.plot(f[m], dbf(2 * rq[1]["out"])[m], color='#eda100', lw=1.3, label='inductor Q = 50')
ax.axhline(-RP, color=axis_c, ls='--', lw=1); ax.text(80, -RP + 0.03, '-0.5 dB', color=ink2, fontsize=9)
ax.set_xlabel('Frequency (Hz)', color=ink2); ax.set_ylabel('Magnitude (dB)', color=ink2)
ax.set_ylim(-1.8, 0.15)
ax.set_title('Passband: equal ripple', loc='left', color=ink, fontsize=11); ax.legend(frameon=False, labelcolor=ink2, loc='lower left', fontsize=9)
ax = axs[2]; style(ax, False)
mm = f <= 5.2e3
ax.plot(f[mm], gd[mm] * 1e3, color='#8a63d2', lw=2)
ax.set_xlabel('Frequency (Hz)', color=ink2); ax.set_ylabel('Group delay (ms)', color=ink2)
ax.set_title('Group delay', loc='left', color=ink, fontsize=11)
fig.suptitle('Elliptic RLC filter: Rs = RL = 1 kΩ, fc = 5 kHz, 0.5 dB ripple, 50 dB stopband', x=0.01, ha='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("elliptic_filter.png", dpi=150, facecolor=surface)
