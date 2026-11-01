# Exponential sources (SPICE EXP): ExpVoltage drives an RC filter, ExpCurrent charges a capacitor
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import ExpVoltage, ExpCurrent, Resistor, Capacitor
from pyams.models.ExpVoltage import exp_wave

# --- 1) ExpVoltage -> R -> C  (R C = 0.2 ms)
V = ExpVoltage("in", "0"); V.setParams("V1=0 V2=5 TD1=1m TAU1=1m TD2=5m TAU2=2m")
R = Resistor("in", "out"); R.setParams("R=1KΩ")
C = Capacitor("out", "0"); C.setParams("C=0.2uF")
c1 = circuit(); c1.addElements({"V": V, "R": R, "C": C}); c1.setOutPuts("in", "out")
c1.analysis(mode="tran", start=0, stop=12e-3, step=2e-6, adaptive=True, max_step=2e-6, order=2)
r1 = c1.run(); t = np.array(r1["time"])
vin_ref = np.array([exp_wave(x, 0, 5, 1e-3, 1e-3, 5e-3, 2e-3) for x in t])
print("ExpVoltage: max |V(in) - formula| = %.2e V" % np.max(np.abs(np.array(r1["in"]) - vin_ref)))

# reference for the RC output: integrate dvo/dt = (vin - vo)/RC numerically (fine grid)
tt = np.linspace(0, 12e-3, 120001); vi = np.array([exp_wave(x, 0, 5, 1e-3, 1e-3, 5e-3, 2e-3) for x in tt])
vo = np.zeros_like(tt); tau = 1e3 * 0.2e-6
for k in range(1, len(tt)):
    h = tt[k] - tt[k-1]; vo[k] = (vo[k-1] + h/tau*vi[k]) / (1 + h/tau)
print("RC output: max |V(out) - reference| = %.2e V" % np.max(np.abs(np.interp(t, tt, vo) - np.array(r1["out"]))))

# --- 2) ExpCurrent -> C parallel R (1 k): V = I R after a first-order rise
I = ExpCurrent("0", "n1"); I.setParams("I1=0 I2=2m TD1=0.5m TAU1=1m TD2=4m TAU2=1m")   # p=0 -> n=n1 : pushes current into n1
Rl = Resistor("n1", "0"); Rl.setParams("R=1KΩ")
Cl = Capacitor("n1", "0"); Cl.setParams("C=0.5uF")
c2 = circuit(); c2.addElements({"I": I, "R": Rl, "C": Cl}); c2.setOutPuts("n1")
c2.analysis(mode="tran", start=0, stop=10e-3, step=2e-6, adaptive=True, max_step=2e-6, order=2)
r2 = c2.run(); t2 = np.array(r2["time"]); v2 = np.array(r2["n1"])
ii = np.array([exp_wave(x, 0, 2e-3, 0.5e-3, 1e-3, 4e-3, 1e-3) for x in t2])
print("ExpCurrent: peak V(n1) = %.3f V (source peak current x R = 2.0 V max)" % v2.max())

fig, ax = plt.subplots(1, 2, figsize=(11, 3.8), facecolor="#fcfcfb")
ax[0].plot(t*1e3, r1["in"], color="#2a78d6", label="V(in)  ExpVoltage"); ax[0].plot(t*1e3, r1["out"], color="#eb6834", label="V(out)  RC = 0.2 ms")
ax[0].set_xlabel("t (ms)"); ax[0].set_ylabel("V"); ax[0].legend(frameon=False); ax[0].set_title("ExpVoltage", loc="left")
ax[1].plot(t2*1e3, ii*1e3, color="#2a78d6", label="I source (mA)"); ax[1].plot(t2*1e3, v2, color="#eb6834", label="V(n1) (V)")
ax[1].set_xlabel("t (ms)"); ax[1].legend(frameon=False); ax[1].set_title("ExpCurrent into R || C", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("exp_sources.png", dpi=140)
