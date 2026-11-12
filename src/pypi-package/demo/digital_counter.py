# 3-bit counters: ripple counter made of three DFFs, the synchronous Counter model and a
# counter written here with dsignal (a 3-bit bus, Verilog-like assignment), clocked by
# DigitalClock; the outputs also drive analog loads (resistor + diode).
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit, model, dsignal
from pyams.models import DigitalClock, DFF, Counter, Resistor, Diode

class MyCounter(model):
    """3-bit counter written with dsignal: `Q <<= Q + 1` on the rising edge (wraps at 8)."""
    def __init__(self, clk, q):
        self.Clk = dsignal('in', clk)
        self.Q = dsignal('out', q, width=3)            # nodes u[0], u[1], u[2]

    def digital(self):
        if self.Clk.rising:
            self.Q <<= self.Q + 1


T = 1e-6                                           # 1 MHz clock
ck = DigitalClock("clk"); ck.setParams("Freq=1MEG Duty=0.5 Td=0.5u")

# --- ripple counter: every flip-flop divides by two and clocks the next one with its Qn
f0 = DFF("nq0", "clk", "q0", "nq0")
f1 = DFF("nq1", "nq0", "q1", "nq1")
f2 = DFF("nq2", "nq1", "q2", "nq2")
# --- synchronous counter
cn = Counter("clk", ["s0", "s1", "s2"])
# --- the same counter written with a dsignal bus
mc = MyCounter("clk", "u")
# --- analog load on the LSB of the ripple counter: 1 kOhm + diode (like an LED)
rl = Resistor("q0", "led"); rl.setParams("R=1KΩ")
dl = Diode("led", "0")

c = circuit()
c.addElements({"CK": ck, "F0": f0, "F1": f1, "F2": f2, "CN": cn, "MC": mc, "RL": rl, "DL": dl})
c.setOutPuts("clk", "q0", "q1", "q2", "s0", "s1", "s2", "led", "CN.Q", "MC.Q", "u[1]")
c.analysis(mode="tran", start=0, stop=26 * T, step=20e-9, adaptive=True, order=2, max_step=40e-9)
r = c.run(); t = np.array(r["time"])
print("accepted steps:", c.stats["accepted"], " rejected:", c.stats["rejected"])

ok_r = ok_s = 0
rows = []
for k in range(24):                                 # sample in the middle of every clock period
    tm = 0.5 * T + (k + 0.5) * T + 0.25 * T         # 0.25 T after the rising edge... high phase
    rip = sum(int(np.interp(tm, t, r["q%d" % i]) > 2.5) << i for i in range(3))
    syn = sum(int(np.interp(tm, t, r["s%d" % i]) > 2.5) << i for i in range(3))
    exp = (k + 1) % 8                               # rising edge number k+1 has happened
    ok_r += rip == exp; ok_s += syn == exp
    rows.append((k, exp, rip, syn))
print("ripple counter matches the expected count in %d of 24 periods; synchronous Counter in %d of 24" % (ok_r, ok_s))
print("sequence (ripple):", [x[2] for x in rows][:16])
m = (t > 10 * T)
vq = np.array(r["q0"])
hi = vq[m][vq[m] > 2.5]
print("q0 loaded by 1k + diode: high level = %.3f V (unloaded 5 V), diode voltage %.3f V, I = %.2f mA" %
      (np.median(hi), np.median(np.array(r["led"])[m][vq[m] > 2.5]), 1e3 * (np.median(hi) - np.median(np.array(r["led"])[m][vq[m] > 2.5])) / 1e3))
# state really holds: the recorded count is the same just before and just after the next edge minus the delay
cnt = np.array(r["CN.Q"])
print("CN.Q goes through", sorted(set(np.round(cnt).astype(int))), "and ends at", int(round(cnt[-1])))
mcq = np.array(r["MC.Q"])
print("dsignal counter MC (bus u[0..2]) equals the Counter model at every point: %s ; its pin u[1] equals s1: %s"
      % (bool(np.all(mcq == cnt)), bool(np.max(np.abs(np.array(r["u[1]"]) - np.array(r["s1"]))) < 1e-6)))

# --- figure
fig, ax = plt.subplots(8, 1, figsize=(10, 9), sharex=True, facecolor="#fcfcfb")
names = ["clk", "q0", "q1", "q2", "s0", "s1", "s2", "led"]
cols = ["#0b0b0b", "#2a78d6", "#2a78d6", "#2a78d6", "#eb6834", "#eb6834", "#eb6834", "#1baf7a"]
for a, n, cl in zip(ax, names, cols):
    a.plot(t * 1e6, r[n], color=cl, lw=1.3); a.set_ylabel(n, rotation=0, labelpad=18, va="center")
    a.set_ylim(-0.5, 5.8); a.set_yticks([0, 5]); a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.5)
    for s in ("top", "right"): a.spines[s].set_visible(False)
ax[-1].set_xlabel("t (us)"); ax[0].set_title("Ripple counter (q0..q2, DFFs) and synchronous Counter (s0..s2)", loc="left")
plt.tight_layout(); plt.savefig("digital_counter.png", dpi=140)
