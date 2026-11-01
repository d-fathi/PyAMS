# PWL sources: arbitrary waveform from (time, value) points
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import PWLVoltage, PWLCurrent, Resistor, Capacitor

# --- 1) PWLVoltage: ramp, plateau, vertical step, repeat -> RC low-pass
pts = "0 0, 1m 4, 2m 4, 2m -2, 3m -2, 4m 0"          # time (s)  value (V); 2m twice = step
V = PWLVoltage("in", "0", points=pts); V.setParams("Rep=1")
R = Resistor("in", "out"); R.setParams("R=1KΩ")
C = Capacitor("out", "0"); C.setParams("C=0.1uF")      # RC = 0.1 ms
c1 = circuit(); c1.addElements({"V": V, "R": R, "C": C}); c1.setOutPuts("in", "out")
c1.analysis(mode="tran", start=0, stop=10e-3, step=2e-6, adaptive=True, max_step=2e-6, order=2)
r1 = c1.run(); t = np.array(r1["time"]); vin = np.array(r1["in"])
ts = np.array([0, 1e-3, 2e-3, 2e-3, 3e-3, 4e-3]); vs = np.array([0, 4, 4, -2, -2, 0.0])
def ref(x):
    x = x % 4e-3
    k = np.searchsorted(ts, x, side="right") - 1
    k = min(k, len(ts) - 2)
    return vs[k] if ts[k+1] == ts[k] else vs[k] + (vs[k+1] - vs[k]) * (x - ts[k]) / (ts[k+1] - ts[k])
exp = np.array([ref(x) for x in t])
mask = np.abs(((t % 4e-3) - 2e-3)) > 5e-6               # ignore the 2 us around the vertical step
print("PWLVoltage: max |V(in) - reference| = %.2e V (outside the step)" % np.max(np.abs(vin - exp)[mask]))
print("            V(in) at 1 ms = %.3f V, at 2.5 ms = %.3f V, at 5 ms (repeat) = %.3f V" % tuple(np.interp([1e-3, 2.5e-3, 5e-3], t, vin)))

# --- 2) PWLCurrent into R || C, single shot, with delay and scale
I = PWLCurrent("0", "n1", points="0 0, 1m 2m, 3m 2m, 4m 0"); I.setParams("Td=0.5m Scale=0.5")
Rl = Resistor("n1", "0"); Rl.setParams("R=1KΩ")
c2 = circuit(); c2.addElements({"I": I, "R": Rl}); c2.setOutPuts("n1")
c2.analysis(mode="tran", start=0, stop=6e-3, step=2e-6, adaptive=True, max_step=2e-6)
r2 = c2.run(); t2 = np.array(r2["time"]); v2 = np.array(r2["n1"])
print("PWLCurrent: V(n1) plateau = %.3f V (Scale 0.5 x 2 mA x 1 k = 1.000), at t=0.4 ms: %.3f (delay)" %
      (np.interp(2.5e-3, t2, v2), np.interp(0.4e-3, t2, v2)))

fig, ax = plt.subplots(1, 2, figsize=(11, 3.8), facecolor="#fcfcfb")
ax[0].plot(t*1e3, vin, color="#2a78d6", label="V(in) PWL, repeating"); ax[0].plot(t*1e3, r1["out"], color="#eb6834", label="V(out) RC = 0.1 ms")
ax[0].set_xlabel("t (ms)"); ax[0].set_ylabel("V"); ax[0].legend(frameon=False); ax[0].set_title("PWLVoltage", loc="left")
ax[1].plot(t2*1e3, v2, color="#eb6834"); ax[1].set_xlabel("t (ms)"); ax[1].set_ylabel("V(n1)"); ax[1].set_title("PWLCurrent through 1 k (Td=0.5 ms, Scale=0.5)", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("pwl_sources.png", dpi=140)
