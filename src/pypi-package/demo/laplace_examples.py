# Laplace transfer-function blocks: LaplaceND (numerator / denominator) and LaplaceZP (zeros / poles)
#   1) 5th-order elliptic low-pass as ONE block: AC response and step response vs scipy
#   2) LaplaceZP resonator, a block with a direct term (high-pass) and DC-gain checks
#   3) PID controller + 2nd-order plant in a closed loop (VCVS makes the error) vs the closed-loop transfer function
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import signal
from pyams.lib import circuit
from pyams.models import LaplaceND, LaplaceZP, ACVoltage, PWLVoltage, VCVS, DCVoltage, Resistor, Capacitor

# ---------------------------------------------------------------- 1) elliptic filter
b, a = signal.ellip(5, 0.5, 50, 2 * np.pi * 5e3, btype="low", analog=True)
V = ACVoltage("in", "0"); H = LaplaceND("in", "0", "out", "0", num=b, den=a)
c = circuit(); c.addElements({"V": V, "H": H}); c.setOutPuts("out")
c.analysis(mode="ac", start=100, stop=1e6, step=100)
ac = c.run(); f = ac["freq"]
_, href = signal.freqs(b, a, 2 * np.pi * f)
print("1) elliptic: max |H_sim - H_scipy| over AC = %.2e   (poles: %d, zeros: %d)" % (np.max(np.abs(ac["out"] - href)), len(H.poles()), len(H.zeros())))

Vs = PWLVoltage("in", "0", points="0 0, 20u 0, 20.001u 1, 1 1")      # 1 V step at 20 us
H2 = LaplaceND("in", "0", "out", "0", num=b, den=a)
c = circuit(); c.addElements({"V": Vs, "H": H2}); c.setOutPuts("out")
c.analysis(mode="tran", start=0, stop=1e-3, step=1e-6, adaptive=True, max_step=2e-6, order=2, lte=1e-5)
tr = c.run(); t = np.array(tr["time"]); y = np.array(tr["out"])
ts, ys = signal.step((b, a), T=np.linspace(0, 1e-3 - 20e-6, 4000))
yref = np.interp(t - 20e-6, ts, ys, left=0)
print("   step response: max |y_sim - y_scipy| = %.2e V" % np.max(np.abs(y - yref)[t > 22e-6]))

# ---------------------------------------------------------------- 2) zero-pole, direct term, DC gain
w0, zeta = 2 * np.pi * 1e3, 0.1
Z = LaplaceZP("in", "0", "out", "0")
Z.setPoles([w0 * (-zeta + 1j * np.sqrt(1 - zeta**2)), w0 * (-zeta - 1j * np.sqrt(1 - zeta**2))]); Z.setDcGain(1.0)
Vz = ACVoltage("in", "0")
c = circuit(); c.addElements({"V": Vz, "Z": Z}); c.setOutPuts("out")
c.analysis(mode="ac", start=10, stop=1e5, step=200); rz = c.run(); fz = rz["freq"]; s = 2j * np.pi * fz
hz = w0**2 / (s**2 + 2 * zeta * w0 * s + w0**2)
print("2) LaplaceZP resonator: max AC error %.2e;  |H| peak = %.3f (1/(2 zeta) = %.3f)" % (np.max(np.abs(rz["out"] - hz)), np.abs(rz["out"]).max(), 1 / (2 * zeta)))

Hp = LaplaceND("in", "0", "out", "0", num=[1, 0, 0], den=[1, 2 * np.pi * 1e3, (2 * np.pi * 1e3) ** 2])   # s^2 / (...)  deg N = deg D
c = circuit(); c.addElements({"V": ACVoltage("in", "0"), "H": Hp}); c.setOutPuts("out")
c.analysis(mode="ac", start=10, stop=1e6, step=50); rh = c.run(); s = 2j * np.pi * rh["freq"]
print("   high-pass with direct term: max AC error %.2e,  |H(1 MHz)| = %.4f (-> 1)" % (np.max(np.abs(rh["out"] - s**2 / (s**2 + 2 * np.pi * 1e3 * s + (2 * np.pi * 1e3)**2))), abs(rh["out"][-1])))

Hd = LaplaceND("in", "0", "out", "0", num=[3e6], den=[1, 2e3, 1e6])
c = circuit(); Vd = DCVoltage("in", "0"); Vd.setParams("Vdc=2"); c.addElements({"V": Vd, "H": Hd}); c.setOutPuts("out")
c.analysis(mode="dc", start=0, stop=1, step=1); print("   DC operating point: 3e6/(s^2+2e3 s+1e6) with 2 V in -> %.4f V (expected 6)" % c.run()["out"][0])

# ---------------------------------------------------------------- 3) PID + plant, closed loop
wn, zt = 200.0, 0.2                      # plant: wn^2 / (s^2 + 2 zt wn s + wn^2)
Kp, Ki, Kd, tau = 2.0, 300.0, 0.005, 1e-3  # PID with filtered derivative: Kp + Ki/s + Kd s / (tau s + 1)
num_c = [Kp * tau + Kd, Kp + Ki * tau, Ki]; den_c = [tau, 1.0, 0.0]
num_p = [wn**2]; den_p = [1.0, 2 * zt * wn, wn**2]
r = PWLVoltage("r", "0", points="0 0, 10m 0, 10.001m 1, 10 1")
err = VCVS("err", "0", "r", "y"); err.setParams("Gain=1")
pid = LaplaceND("err", "0", "u", "0", num=num_c, den=den_c)
plant = LaplaceND("u", "0", "y", "0", num=num_p, den=den_p)
c = circuit(); c.addElements({"R": r, "E": err, "C": pid, "P": plant}); c.setOutPuts("y", "u")
c.analysis(mode="tran", start=0, stop=0.6, step=0.2e-3, adaptive=True, max_step=0.5e-3, order=2, lte=1e-5)
rp = c.run(); t3 = np.array(rp["time"]); y3 = np.array(rp["y"]); u3 = np.array(rp["u"])
# closed-loop reference:  T = CG / (1 + CG)
n_ol = np.polymul(num_c, num_p); d_ol = np.polymul(den_c, den_p)
n_cl, d_cl = n_ol, np.polyadd(d_ol, n_ol)
print("3) closed-loop poles (rad/s):", np.round(np.roots(d_cl), 1))
tt, yy = signal.step((n_cl, d_cl), T=np.linspace(0, 0.6 - 10e-3, 20000))
yref3 = np.interp(t3 - 10e-3, tt, yy, left=0)
m = t3 > 10.1e-3
print("   PID loop: max |y_sim - y_ref| = %.2e (of 1 V);  overshoot %.1f %%,  y(0.6 s) = %.4f" % (np.max(np.abs(y3 - yref3)[m]), 100 * (y3.max() - 1), y3[-1]))

# ---------------------------------------------------------------- figure
ink = "#0b0b0b"; cols = ["#2a78d6", "#eb6834", "#1baf7a", "#8a63d2"]
fig, ax = plt.subplots(2, 2, figsize=(12, 7.2), facecolor="#fcfcfb")
ax[0, 0].semilogx(f, 20 * np.log10(np.abs(ac["out"])), color=cols[0], lw=1.8, label="LaplaceND")
ax[0, 0].semilogx(f, 20 * np.log10(np.abs(href)), "--", color=cols[1], lw=1, label="scipy")
ax[0, 0].set_ylim(-90, 5); ax[0, 0].set_xlabel("Hz"); ax[0, 0].set_ylabel("dB"); ax[0, 0].legend(frameon=False); ax[0, 0].set_title("Elliptic 5th order, one block", loc="left")
ax[0, 1].plot(t * 1e6, y, color=cols[0], lw=1.6, label="PyAMS"); ax[0, 1].plot(t * 1e6, yref, "--", color=cols[1], lw=1, label="scipy")
ax[0, 1].set_xlabel("t (us)"); ax[0, 1].set_ylabel("V"); ax[0, 1].legend(frameon=False); ax[0, 1].set_title("Step response", loc="left")
ax[1, 0].semilogx(fz, 20 * np.log10(np.abs(rz["out"])), color=cols[2], lw=1.6, label="LaplaceZP resonator")
ax[1, 0].semilogx(rh["freq"], 20 * np.log10(np.abs(rh["out"])), color=cols[3], lw=1.6, label="high-pass (direct term)")
ax[1, 0].set_xlabel("Hz"); ax[1, 0].set_ylabel("dB"); ax[1, 0].legend(frameon=False); ax[1, 0].set_title("Zero-pole and direct term", loc="left")
ax[1, 1].plot(t3, y3, color=cols[0], lw=1.6, label="y (plant output)"); ax[1, 1].plot(t3, np.interp(t3 - 10e-3, tt, yy, left=0), "--", color=cols[1], lw=1, label="closed-loop TF")
ax[1, 1].plot(t3, np.clip(u3, -2, 6) / 6, color=cols[2], lw=1, alpha=.8, label="u / 6 (control)")
ax[1, 1].set_xlabel("t (s)"); ax[1, 1].legend(frameon=False, fontsize=8); ax[1, 1].set_title("PID + 2nd-order plant, closed loop", loc="left")
for a_ in ax.ravel():
    a_.set_facecolor("#fcfcfb"); a_.grid(color="#e1e0d9", lw=.6)
    for s_ in ("top", "right"): a_.spines[s_].set_visible(False)
plt.tight_layout(); plt.savefig("laplace_examples.png", dpi=140)
