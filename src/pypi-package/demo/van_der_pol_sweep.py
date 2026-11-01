# Van der Pol oscillator: parametric sweep of Mu with cir.sweep(param="R1.Mu", list=[...])
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from pyams.lib import circuit
from pyams.models import NonlinearResistance, CapacitorIc, InductorIc

mus = [0.1, 0.5, 1.0, 2.0, 4.0]
R1 = NonlinearResistance("Vout", "0")
C1 = CapacitorIc("Vout", "0"); C1.setParams("C=1 Ic=2")
L1 = InductorIc("Vout", "0");  L1.setParams("L=1 Ic=-6")
cir = circuit(); cir.addElements({"R1": R1, "C1": C1, "L1": L1}); cir.setOutPuts("Vout")
cir.analysis(mode="tran", start=0, stop=80, step=0.01, adaptive=True, max_step=0.02, order=2, lte=1e-5)
cir.sweep(param="R1.Mu", list=mus)
runs = cir.run()                                    # one result dict per Mu

def period(t, v):
    up = t[1:][(v[:-1] < 0) & (v[1:] >= 0)]
    return np.diff(up[-3:]).mean()

cols = ["#2a78d6", "#eb6834", "#1baf7a", "#8a63d2", "#b8860b"]
fig, ax = plt.subplots(1, 3, figsize=(14, 4), facecolor="#fcfcfb")
print(" Mu    amplitude   period PyAMS   period scipy")
Ts = []
for r, c in zip(runs, cols):
    mu = r["param"]; t = np.array(r["time"]); v = np.array(r["Vout"])
    f = lambda tt, y: [-y[1] - mu * (y[0]**3 / 3 - y[0]), y[0]]
    ref = solve_ivp(f, (0, 80), [2.0, -6.0], rtol=1e-10, atol=1e-12, dense_output=True, t_eval=t)
    Tp, Tr = period(t, v), period(t, ref.y[0]); Ts.append(Tp)
    print("%4.1f   %8.3f   %10.3f   %10.3f" % (mu, v[t > 40].max(), Tp, Tr))
    ax[0].plot(t, v, color=c, lw=1.3, label="Mu = %g" % mu)
    ax[1].plot(v, np.gradient(v, t), color=c, lw=1.2)
ax[0].set_xlim(0, 40); ax[0].set_xlabel("Time [s]"); ax[0].set_ylabel("Vout [V]"); ax[0].legend(frameon=False, ncol=2, fontsize=8); ax[0].set_title("Vout for several Mu", loc="left")
ax[1].set_xlabel("Vout"); ax[1].set_ylabel("dVout/dt"); ax[1].set_title("Phase portrait", loc="left")
ax[2].plot(mus, Ts, "o-", color="#2a78d6"); ax[2].set_xlabel("Mu"); ax[2].set_ylabel("period [s]"); ax[2].set_title("Period vs Mu", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("van_der_pol_sweep.png", dpi=140)
