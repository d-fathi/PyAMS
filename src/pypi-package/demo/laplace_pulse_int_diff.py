# Integral and derivative of a periodic pulse with LaplaceND blocks
#   integrator   H_i(s) = 1 / (Ti s)                     (pole at s = 0)
#   derivative   H_d(s) = Td s / (Tf s + 1)               (ideal "s" is improper -> small filter pole Tf)
#   cascade      integrator -> derivative gives back the pulse
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import signal
from pyams.lib import circuit
from pyams.models import LaplaceND, TrapezoidVoltage

Tper, Tr, Tw = 1e-3, 50e-6, 450e-6          # period 1 ms (1 kHz), edges 50 us, flat top 450 us
V1 = 5.0
Ti, Td, Tf = 2e-3, Tr, Tr / 25              # integrator constant, derivative constant, derivative filter pole

P = TrapezoidVoltage("in", "0"); P.setParams("V0=0 V1=5 Td=0 Tr=50u Tw=450u Tf=50u T=1m")
I = LaplaceND("in", "0", "int", "0", num=[1], den=[Ti, 0])               # 1 / (Ti s)
D = LaplaceND("in", "0", "dif", "0", num=[Td, 0], den=[Tf, 1])           # Td s / (Tf s + 1)
D2 = LaplaceND("int", "0", "back", "0", num=[Ti, 0], den=[Tf, 1])         # derivative of the integral, scaled by Ti

c = circuit(); c.addElements({"P": P, "I": I, "D": D, "D2": D2}); c.setOutPuts("in", "int", "dif", "back")
# uic=True: start from zero state (the integrator has a pole at s = 0, so there is no unique operating point)
c.analysis(mode="tran", start=0, stop=5e-3, step=1e-6, uic=True, order=2, adaptive=True, max_step=4e-6, lte=1e-5)
r = c.run(); t = np.array(r["time"])

# ------------------------------------------------------------ references (exact waveform + scipy lsim)
def pulse(x):
    x = x % Tper
    return np.where(x < Tr, V1 * x / Tr, np.where(x < Tr + Tw, V1, np.where(x < 2 * Tr + Tw, V1 * (1 - (x - Tr - Tw) / Tr), 0.0)))
tf = np.linspace(0, 5e-3, 500001); vf = pulse(tf)
_, y_int, _ = signal.lsim(([1], [Ti, 0]), vf, tf)
_, y_dif, _ = signal.lsim(([Td, 0], [Tf, 1]), vf, tf)
ref_int = np.interp(t, tf, y_int); ref_dif = np.interp(t, tf, y_dif)
ex = np.cumsum(vf) * (tf[1] - tf[0]) / Ti           # plain numerical integral of the waveform
print("integrator : max |y - lsim| = %.2e V ;  y(5 ms) = %.4f V, exact area/Ti = %.4f V" % (np.max(np.abs(r["int"] - ref_int)), np.interp(5e-3, t, r["int"]), ex[-1]))
print("             rise per period = %.4f V (mean 2.5 V x 1 ms / Ti = %.4f V)" % (np.interp(4e-3, t, r["int"]) - np.interp(3e-3, t, r["int"]), 2.5e-3 / Ti))
print("derivative : max |y - lsim| = %.2e V ;  plateau on the rising edge = %.3f V (Td dv/dt = %.3f V)" % (np.max(np.abs(r["dif"] - ref_dif)), np.interp(1e-3 + 25e-6, t, r["dif"]), Td * V1 / Tr))
m = t > 0.2e-3
print("cascade    : max |back - input| = %.3f V (derivative filter pole only; 5 V pulse)" % np.max(np.abs((np.array(r["back"]) - np.array(r["in"]))[m]))
      )

# ------------------------------------------------------------ figure
cols = ["#2a78d6", "#eb6834", "#1baf7a", "#8a63d2"]
fig, ax = plt.subplots(3, 1, figsize=(10, 8.5), sharex=True, facecolor="#fcfcfb")
ax[0].plot(t * 1e3, r["in"], color=cols[0], lw=1.6); ax[0].set_ylabel("pulse (V)"); ax[0].set_title("Periodic pulse, 1 kHz", loc="left")
ax[1].plot(t * 1e3, r["int"], color=cols[1], lw=1.8, label="LaplaceND  1/(Ti s), Ti = 2 ms"); ax[1].plot(t * 1e3, ref_int, "--", color="#0b0b0b", lw=.8, label="scipy lsim")
ax[1].set_ylabel("integral (V)"); ax[1].legend(frameon=False); ax[1].set_title("Integral: one staircase step per period (mean 2.5 V)", loc="left")
ax[2].plot(t * 1e3, r["dif"], color=cols[2], lw=1.6, label="LaplaceND  Td s/(Tf s + 1)"); ax[2].plot(t * 1e3, ref_dif, "--", color="#0b0b0b", lw=.8, label="scipy lsim")
ax[2].set_ylabel("derivative (V)"); ax[2].set_xlabel("t (ms)"); ax[2].legend(frameon=False, loc="upper right"); ax[2].set_title("Derivative: +/-Td V1/Tr = +/-5 V pulses on the edges", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("laplace_pulse_int_diff.png", dpi=140)
