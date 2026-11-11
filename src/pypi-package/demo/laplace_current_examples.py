# Current-mode Laplace blocks: LaplaceNDII (i->i), LaplaceNDIV (i->v), LaplaceNDVI (v->i)
#   (zero-pole forms: LaplaceZPII, LaplaceZPIV, LaplaceZPVI)
#   1) current gain  H = 1/(1 + s/w0)  (LaplaceNDII):   Iin -> low-pass -> Iout into a load
#   2) transimpedance  Vout/Iin = 1/(C s)  (LaplaceNDIV):  behaves as an ideal capacitor (checked against Capacitor)
#   3) transconductance  Iout/Vin = 1/(L s)  (LaplaceNDVI):  behaves as an ideal inductor (checked against Inductor)
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import LaplaceNDII, LaplaceNDIV, LaplaceNDVI, ACCurrent, ACVoltage, PWLCurrent, Resistor, Capacitor, Inductor

# ------------------------------------------------------- 1) current gain, AC
f0 = 2e3; w0 = 2 * np.pi * f0; Rl = 1e3
Is = ACCurrent("0", "a"); Is.setParams("Iac=1m")                   # pushes 1 mA (AC) into node a
H = LaplaceNDII("a", "0", "0", "b", num=[2.0], den=[1 / w0, 1])   # gain 2, pole at 2 kHz
R = Resistor("b", "0"); R.setParams("R=1KΩ")
c = circuit(); c.addElements({"I": Is, "H": H, "R": R}); c.setOutPuts("b", "a")
c.analysis(mode="ac", start=10, stop=1e6, step=50); r = c.run(); f = r["freq"]
href = 2.0 / (1 + 1j * f / f0) * 1e-3 * Rl
print("1) current gain: max |V(b) - 2 Rl Iin /(1+jf/f0)| = %.2e V ;  V(a) (ammeter input) max = %.1e V" % (np.max(np.abs(r["b"] - href)), np.max(np.abs(r["a"]))))

# ------------------------------------------------------- 2) transimpedance 1/(C s) vs Capacitor, transient
C = 1e-6
Ip = PWLCurrent("0", "x", points="0 0, 0.2m 1m, 0.6m 1m, 0.8m -0.5m, 1.5m -0.5m, 1.6m 0, 3m 0")
Cap = Capacitor("x", "0"); Cap.setParams("C=1uF")
Ip2 = PWLCurrent("0", "a2", points="0 0, 0.2m 1m, 0.6m 1m, 0.8m -0.5m, 1.5m -0.5m, 1.6m 0, 3m 0")
Z = LaplaceNDIV("a2", "0", "vz", "0", num=[1], den=[C, 0])
c = circuit(); c.addElements({"I1": Ip, "C": Cap, "I2": Ip2, "Z": Z}); c.setOutPuts("x", "vz")
c.analysis(mode="tran", start=0, stop=3e-3, step=2e-6, uic=True, order=2, adaptive=True, max_step=2e-6, lte=1e-6)
r2 = c.run(); t = np.array(r2["time"])
print("2) integrator via Z(s) = 1/(C s) (LaplaceNDIV) vs a real Capacitor: max |V_laplace - V_C| = %.2e V (V_C(3 ms) = %.4f V)" % (np.max(np.abs(np.array(r2["vz"]) - np.array(r2["x"]))), r2["x"][-1]))

# ------------------------------------------------------- 3) transconductance 1/(L s) vs Inductor, AC
L = 10e-3
V1 = ACVoltage("vs", "0")
Rs = Resistor("vs", "v"); Rs.setParams("R=10Ω")     # series resistor: an ideal source across an ideal inductor has no DC solution
Ind = Inductor("v", "0"); Ind.setParams("L=10mH")
Y = LaplaceNDVI("v", "0", "0", "il", num=[1], den=[L, 0])
Rm = Resistor("il", "0"); Rm.setParams("R=1Ω")
c = circuit(); c.addElements({"V": V1, "Rs": Rs, "L": Ind, "Y": Y, "R": Rm}); c.setOutPuts("il", "L.I")
c.analysis(mode="ac", start=10, stop=1e5, step=40); r3 = c.run(); f3 = r3["freq"]
# the inductor current flows v -> 0 ; Y.Iout flows 0 -> il through the block: both are I = V/(j w L) up to the sign convention
iref = 1.0 / (10.0 + 2j * np.pi * f3 * L)          # 1 V source, 10 ohm in series with the (ideal) inductor
print("3) transconductance 1/(L s) (LaplaceNDVI): max |V(il)/1 ohm - I_L| = %.2e A ;  max |I_L - 1/(Rs + j w L)| = %.2e A" % (
    np.max(np.abs(r3["il"] - r3["L.I"])), np.max(np.abs(r3["L.I"] - iref))))

# ------------------------------------------------------- figure
cols = ["#2a78d6", "#eb6834", "#1baf7a"]
fig, ax = plt.subplots(1, 3, figsize=(14, 3.9), facecolor="#fcfcfb")
ax[0].semilogx(f, 20 * np.log10(np.abs(r["b"] / (1e-3 * Rl))), color=cols[0], lw=1.8, label="Iout/Iin (PyAMS)")
ax[0].semilogx(f, 20 * np.log10(np.abs(href / (1e-3 * Rl))), "--", color="#0b0b0b", lw=.8, label="2/(1+jf/f0)")
ax[0].set_xlabel("Hz"); ax[0].set_ylabel("dB"); ax[0].legend(frameon=False); ax[0].set_title("LaplaceNDII: current gain", loc="left")
ax[1].plot(t * 1e3, r2["x"], color=cols[1], lw=1.8, label="Capacitor"); ax[1].plot(t * 1e3, r2["vz"], "--", color="#0b0b0b", lw=.9, label="1/(C s)  (LaplaceNDIV)")
ax[1].set_xlabel("t (ms)"); ax[1].set_ylabel("V"); ax[1].legend(frameon=False); ax[1].set_title("LaplaceNDIV: ideal capacitor", loc="left")
ax[2].loglog(f3, np.abs(r3["L.I"]), color=cols[2], lw=1.8, label="Inductor |I|"); ax[2].loglog(f3, np.abs(r3["il"]), "--", color="#0b0b0b", lw=.9, label="1/(L s)  (LaplaceNDVI)")
ax[2].set_xlabel("Hz"); ax[2].set_ylabel("A"); ax[2].legend(frameon=False); ax[2].set_title("LaplaceNDVI: ideal inductor", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("laplace_current_examples.png", dpi=140)
