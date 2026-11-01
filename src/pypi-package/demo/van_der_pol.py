# Van der Pol oscillator:  C v'' + Mu (v^2 - 1) v' + v/L = 0
#   R1 nonlinear resistance, C1 (Ic = 2 V), L1 (Ic = -6 A) in parallel on node Vout
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from pyams.lib import circuit
from pyams.models import NonlinearResistance, CapacitorIc, InductorIc

R1 = NonlinearResistance("Vout", "0"); R1.setParams("Mu=1")
C1 = CapacitorIc("Vout", "0");          C1.setParams("C=1 Ic=2")
L1 = InductorIc("Vout", "0");           L1.setParams("L=1 Ic=-6")

cir = circuit()
cir.addElements({"R1": R1, "C1": C1, "L1": L1})
cir.setOutPuts("Vout")
cir.analysis(mode="tran", start=0, stop=70, step=0.01, adaptive=True, max_step=0.02, order=2)
res = cir.run()
t, v = np.array(res["time"]), np.array(res["Vout"])

# reference: same equations integrated by scipy
mu, C, L = 1.0, 1.0, 1.0
f = lambda t, y: [(-y[1] - mu * (y[0]**3 / 3 - y[0])) / C, y[0] / L]
ref = solve_ivp(f, (0, 70), [2.0, -6.0], rtol=1e-10, atol=1e-12, t_eval=t)
print("V(0) = %.4f V" % v[0])
print("max |v_sim - v_scipy| = %.2e V" % np.max(np.abs(v - ref.y[0])))
m = t > 20
print("limit cycle: peak %.3f / %.3f V" % (v[m].max(), v[m].min()))
up = t[1:][(v[:-1] < 0) & (v[1:] >= 0)]
print("period = %.3f s (Van der Pol mu=1: 6.663 s)" % np.diff(up[-5:]).mean())

dv = np.gradient(v, t)
fig, ax = plt.subplots(1, 2, figsize=(11, 3.9), facecolor="#fcfcfb")
ax[0].plot(t, v, color="#2a78d6", lw=1.6, label="Vout (PyAMS)"); ax[0].plot(ref.t, ref.y[0], "--", color="#eb6834", lw=1, label="scipy")
ax[0].set_xlabel("Time [s]"); ax[0].set_ylabel("V"); ax[0].legend(frameon=False); ax[0].set_title("Vout", loc="left")
ax[1].plot(v, dv, color="#2a78d6", lw=1.4); ax[1].set_xlabel("Vout"); ax[1].set_ylabel("dVout/dt"); ax[1].set_title("Phase portrait", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("van_der_pol.png", dpi=140)
