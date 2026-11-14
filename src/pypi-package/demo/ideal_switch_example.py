#-------------------------------------------------------------------------------
# Name:        switch_example
# Author:      d.fathi
# Created:     12/11/2026
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# IdealSwitch: a 0 V source between p and n while Vc > Vt, removed (I = 0) otherwise.
# A 1 kHz sine Vc (amplitude 2 V, threshold Vt = 0.5 V) closes the switch while it is above
# 0.5 V.  Through the switch a 5 V source charges C = 1 uF via R = 100 ohm:
# (uic=True: the capacitor starts discharged)
# during each closed interval  V_C(t) rises exponentially towards 5 V (tau = R C),
# during the open intervals it holds its value.  Compared with the analytic solution.
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import SinVoltage, DCVoltage, IdealSwitch, Resistor, Capacitor

Vt, R, C, Vs, f = 0.5, 100.0, 1e-6, 5.0, 1e3
ctrl = SinVoltage("vc", "0"); ctrl.setParams("Voff=0 Va=2 Fr=1k")
src = DCVoltage("vs", "0"); src.setParams("Vdc=5")
sw = IdealSwitch("vs", "a", "vc", "0"); sw.setParams("Vt=0.5 Vw=1m")
r = Resistor("a", "b"); r.setParams("R=100")
cap = Capacitor("b", "0"); cap.setParams("C=1u")

ckt = circuit()
ckt.addElements({"VC": ctrl, "VS": src, "SW": sw, "R1": r, "C1": cap})
ckt.setOutPuts("vc", "b")
ckt.analysis(mode="tran", start=0, stop=5e-3, step=2e-6, adaptive=True, order=2,
             max_step=5e-6, lte=1e-4, uic=True)
res = ckt.run()
t = np.array(res["time"]); vc = np.array(res["vc"]); vb = np.array(res["b"])

# analytic: closed while sin(2 pi f t) > Vt/Va, i.e. inside [t1, t2] of every period
Va = 2.0
a1 = np.arcsin(Vt / Va) / (2 * np.pi * f)
a2 = 0.5 / f - a1
tau = R * C
v_an = np.zeros_like(t); v = 0.0; tc = 0.0
for k, tk in enumerate(t):
    if k:
        dt = tk - t[k - 1]
        tm = 0.5 * (tk + t[k - 1]) % (1 / f)
        if a1 <= tm <= a2:                       # closed: exact exponential step
            v = Vs + (v - Vs) * np.exp(-dt / tau)
    v_an[k] = v
err = np.max(np.abs(vb - v_an))
closed = vc > Vt
print("switch closed during %.1f %% of the time (analytic: %.1f %%)" %
      (100 * np.mean(closed), 100 * (a2 - a1) * f))
print("capacitor voltage after 5 periods: %.4f V (analytic %.4f V), max |error| = %.4f V" %
      (vb[-1], v_an[-1], err))
# held value while open: change of Vb during the first open interval (leak through Roff)
i0 = np.searchsorted(t, 0.5 / f + 0.05e-3); i1 = np.searchsorted(t, 0.9 / f)
print("droop while open (ideal: no leakage): %.2e V in %.0f us" % (vb[i0] - vb[i1], 1e6 * (t[i1] - t[i0])))

ink, grid, surf = '#0b0b0b', '#e1e0d9', '#fcfcfb'
fig, ax = plt.subplots(2, 1, figsize=(9, 5.6), sharex=True, facecolor=surf)
for a in ax:
    a.set_facecolor(surf); a.grid(color=grid); a.tick_params(colors=ink)
ax[0].plot(t * 1e3, vc, color='#2a78d6', label="Vc"); ax[0].axhline(Vt, color='#eb6834', ls='--', label="threshold Vt")
ax[0].fill_between(t * 1e3, -2.2, 2.2, where=closed, color='#1baf7a', alpha=.15, label="switch closed")
ax[0].set_ylabel("V"); ax[0].legend(loc="upper right", fontsize=8); ax[0].set_title("Control voltage", color=ink)
ax[1].plot(t * 1e3, vb, color='#2a78d6', label="PyAMS"); ax[1].plot(t * 1e3, v_an, color='#eb6834', ls='--', label="analytic")
ax[1].set_ylabel("V_C (V)"); ax[1].set_xlabel("t (ms)"); ax[1].legend(fontsize=8); ax[1].set_title("Capacitor charged through the switch", color=ink)
fig.tight_layout(); fig.savefig("ideal_switch_example.png", dpi=130, facecolor=surf)
