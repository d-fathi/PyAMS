# Latches, JK flip-flop and shift register driven by PWL patterns, each checked against a
# Python model of the same logic; a ring oscillator (3 inverters); and two models written
# here with dsignal buses (4-bit adder, byte nibble swap) fed by Counter models.
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit, model, dsignal
from pyams.models import PWLVoltage, DigitalClock, SRLatch, DLatch, JKFF, DFF, ShiftRegister, NOT, Counter

class Adder4(model):
    """4-bit adder with carry out, Verilog style:  {C, S} = A + B   (dsignal buses)."""
    def __init__(self, a, b, s, cout):
        self.A = dsignal('in', a, width=4)
        self.B = dsignal('in', b, width=4)
        self.S = dsignal('out', s, width=4)             # truncated to 4 bits
        self.C = dsignal('out', cout)

    def digital(self):
        total = self.A + self.B                         # integer arithmetic on the two buses
        self.S <<= total
        self.C <<= total >> 4


class NibbleSwap(model):
    """Y = {A[3:0], A[7:4]}: bit slices of an 8-bit bus (slice [lo:hi) = bits lo .. hi-1)."""
    def __init__(self, a, y):
        self.A = dsignal('in', a, width=8)
        self.Y = dsignal('out', y, width=8)

    def digital(self):
        self.Y[0:4] <<= self.A[4:8]
        self.Y[4:8] <<= self.A[0:4]


def pattern(bits, T, vh=5.0, tr=2e-9):
    """PWL points of a bit pattern (one bit every T seconds, edges of tr)."""
    pts, cur = [(0.0, bits[0] * vh)], bits[0]
    for k, b in enumerate(bits[1:], 1):
        if b != cur:
            pts += [(k * T, cur * vh), (k * T + tr, b * vh)]
            cur = b
    pts.append((len(bits) * T, cur * vh))
    return pts

def level(t, v, tm):
    return int(np.interp(tm, t, v) > 2.5)

T = 1e-6
# ---------------------------------------------------------------- SR latch + D latch + JK flip-flop
S = PWLVoltage("s", "0", points=pattern([0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0], T))
R = PWLVoltage("r", "0", points=pattern([0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], T))
D = PWLVoltage("d", "0", points=pattern([1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0], T))
EN = PWLVoltage("en", "0", points=pattern([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], T))
J = PWLVoltage("j", "0", points=pattern([1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0], T))
K = PWLVoltage("k", "0", points=pattern([0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0], T))
CK = DigitalClock("clk"); CK.setParams("Freq=500k Td=0.5u")           # rising edges at 0.5, 2.5, 4.5 ... us
sr = SRLatch("s", "r", "q_sr", "qn_sr")
dl = DLatch("d", "en", "q_dl", "qn_dl")
jk = JKFF("j", "k", "clk", "q_jk", "qn_jk")
c = circuit()
c.addElements({"S": S, "R": R, "D": D, "EN": EN, "J": J, "K": K, "CK": CK, "SR": sr, "DL": dl, "JK": jk})
c.setOutPuts("s", "r", "q_sr", "q_dl", "q_jk", "clk")
c.analysis(mode="tran", start=0, stop=12 * T, step=20e-9, adaptive=True, order=2, max_step=40e-9, lte=1e-3)
r1 = c.run(); t = np.array(r1["time"])

bad = {"SR": 0, "DL": 0, "JK": 0}
# reference models, step by step with the pattern lists
sbits = [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]; rbits = [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0]
dbits = [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0]; ebits = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
jbits = [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0]; kbits = [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0]
q_sr = q_dl = q_jk = 0
exp = {"SR": [], "DL": [], "JK": []}
for k in range(12):
    if sbits[k] and not rbits[k]: q_sr = 1
    elif rbits[k] and not sbits[k]: q_sr = 0
    elif sbits[k] and rbits[k]: q_sr = 0
    if ebits[k]: q_dl = dbits[k]
    exp["SR"].append(q_sr); exp["DL"].append(q_dl)
# JK: rising clock edges at 0.5 us + 2 us n; they see the pattern bits of that microsecond (bit 0, 2, 4 ...)
edges = [0.5 + 2 * n for n in range(6)]
q = 0; jk_at = {}
for e in edges:
    kidx = int(e)                                        # bit index of the microsecond that contains the edge
    j_, k_ = jbits[kidx], kbits[kidx]
    q = 1 - q if (j_ and k_) else 1 if j_ else 0 if k_ else q
    jk_at[e] = q
for k in range(12):
    tm = (k + 0.5) * T
    qe = 0
    for e in edges:
        if e < k + 0.8 - 0.05: qe = jk_at[e]            # edge happened more than 50 ns before the sample
    exp["JK"].append(qe)
    got = {"SR": level(t, r1["q_sr"], tm + 0.3 * T), "DL": level(t, r1["q_dl"], tm + 0.3 * T), "JK": level(t, r1["q_jk"], tm + 0.3 * T)}
    for n in got:
        bad[n] += got[n] != exp[n][k]
print("SR latch   : %d mismatches in 12 microseconds   expected %s" % (bad["SR"], exp["SR"]))
print("D latch    : %d mismatches                       expected %s" % (bad["DL"], exp["DL"]))
print("JK flip-flop: %d mismatches                      expected %s" % (bad["JK"], exp["JK"]))

# ---------------------------------------------------------------- 4-bit shift register
bits_in = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0]
DIN = PWLVoltage("din", "0", points=pattern(bits_in, T))
CK2 = DigitalClock("ck2"); CK2.setParams("Freq=1MEG Td=0.5u Duty=0.5")  # rising edges at 0.5, 1.5, ... us
sh = ShiftRegister("din", "ck2", ["p0", "p1", "p2", "p3"])
c = circuit(); c.addElements({"DIN": DIN, "CK": CK2, "SH": sh}); c.setOutPuts("din", "ck2", "p0", "p1", "p2", "p3", "SH.Q")
c.analysis(mode="tran", start=0, stop=12 * T, step=20e-9, adaptive=True, order=2, max_step=40e-9, lte=1e-3)
r2 = c.run(); t2 = np.array(r2["time"])
val = 0; want = []
for k in range(12):                                      # edge k+0.5 us samples the bit of microsecond k
    val = ((val << 1) | bits_in[k]) & 15
    want.append(val)
got = [int(round(np.interp((k + 1.0) * T - 0.05 * T, t2, r2["SH.Q"]))) for k in range(12)]
pins = [sum(level(t2, r2["p%d" % i], (k + 1.0) * T - 0.05 * T) << i for i in range(4)) for k in range(12)]
print("shift register: SH.Q     %s" % got)
print("                expected   %s   (pins agree: %s)" % (want, pins == want))

# ---------------------------------------------------------------- ring oscillator
rings = [NOT("n1", "n2"), NOT("n2", "n3"), NOT("n3", "n1")]
c = circuit(); c.addElements({"I1": rings[0], "I2": rings[1], "I3": rings[2]}); c.setOutPuts("n1")
c.analysis(mode="tran", start=0, stop=1e-6, step=2e-9, adaptive=True, order=2, max_step=2e-9, lte=1e-3)
r3 = c.run(); t3 = np.array(r3["time"]); v3 = np.array(r3["n1"])
up = t3[1:][(v3[:-1] < 2.5) & (v3[1:] >= 2.5)]
per = np.diff(up)
td = 10e-9 + 1e-9 * np.log(1 / 0.3)                   # Tpd + time for the output to cross a threshold (Rout Cout = 1 ns)
print("ring oscillator (3 inverters, Tpd = 10 ns): %d periods, T = %.2f ns;  6 (Tpd + Rout Cout ln(1/0.3)) = %.2f ns" % (len(per), 1e9 * per[2:].mean(), 6e9 * td))

# ---------------------------------------------------------------- buses: adder and nibble swap
ckb = DigitalClock("ckb"); ckb.setParams("Freq=1MEG Td=0.5u")
ca = Counter("ckb", "a", width=4)                                  # counts up    : a[0..3]
cb = Counter("ckb", "b", width=4); cb.setParams("Down=1 Ic=3")     # counts down  : b[0..3]
add = Adder4("a", "b", "sum", "cy")
c8 = Counter("ckb", "w", width=8); c8.setParams("Ic=250")          # 250, 251, ... wraps at 256
sw = NibbleSwap("w", "sw")
c = circuit(); c.addElements({"CK": ckb, "CA": ca, "CB": cb, "AD": add, "C8": c8, "SW": sw})
c.setOutPuts("CA.Q", "CB.Q", "AD.S", "AD.C", "C8.Q", "SW.Y")
c.analysis(mode="tran", start=0, stop=12 * T, step=20e-9, adaptive=True, order=2, max_step=40e-9, lte=1e-3)
r4 = c.run(); t4 = np.array(r4["time"])
bad_add = bad_sw = 0
for k in range(1, 11):                                             # sample 0.4 us after rising edge k
    tm = (k + 0.4) * T + 0.1 * T
    a, b, sm, cy = [int(round(np.interp(tm, t4, r4[n]))) for n in ("CA.Q", "CB.Q", "AD.S", "AD.C")]
    w, y = [int(round(np.interp(tm, t4, r4[n]))) for n in ("C8.Q", "SW.Y")]
    bad_add += (a + b) != sm + 16 * cy
    bad_sw += y != ((w & 15) << 4 | (w >> 4))
print("4-bit adder on dsignal buses: %d mismatches in 10 samples (A + B = S + 16 C), e.g. %d + %d = %d carry %d" % (bad_add, a, b, sm, cy))
print("nibble swap with bit slices : %d mismatches in 10 samples, e.g. 0x%02X -> 0x%02X" % (bad_sw, w, y))

# ---------------------------------------------------------------- figure
fig, ax = plt.subplots(5, 1, figsize=(10, 8.5), sharex=True, facecolor="#fcfcfb")
for a, (n, cl) in zip(ax, [("s", "#8a63d2"), ("q_sr", "#2a78d6"), ("q_dl", "#eb6834"), ("q_jk", "#1baf7a"), ("clk", "#0b0b0b")]):
    a.plot(t * 1e6, r1[n], color=cl, lw=1.4); a.set_ylabel({"s": "S", "q_sr": "Q SR", "q_dl": "Q D-latch", "q_jk": "Q JK", "clk": "clk"}[n], rotation=0, labelpad=30, va="center")
    a.set_yticks([0, 5]); a.set_ylim(-.5, 5.8); a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.5)
    for s_ in ("top", "right"): a.spines[s_].set_visible(False)
ax[-1].set_xlabel("t (us)"); ax[0].set_title("SR latch, D latch and JK flip-flop (checked against the logic tables)", loc="left")
plt.tight_layout(); plt.savefig("digital_sequential.png", dpi=140)
