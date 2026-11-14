#-------------------------------------------------------------------------------
# Name:        Combinational and register blocks built with dsignal
# Author:      d.fathi
# Created:     14/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# An 8-bit Counter (nodes t[0] .. t[7]) clocked at 1 MHz produces every input pattern 0 .. 255.
# The blocks below are connected to its bits and every output is compared, after each clock edge,
# with a Python reference:  Multiplexer, Demultiplexer, Decoder, PriorityEncoder, Adder,
# MagnitudeComparator, ParityGenerator, BinaryToGray + GrayToBinary, SevenSegmentDecoder,
# Register, TFF and LFSR.
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import (DigitalClock, Counter, DCVoltage, Multiplexer, Demultiplexer, Decoder,
                          PriorityEncoder, Adder, MagnitudeComparator, ParityGenerator, BinaryToGray,
                          GrayToBinary, SevenSegmentDecoder, Register, TFF, LFSR)

t_ = lambda a, b: ["t[%d]" % i for i in range(a, b)]               # nodes of the counter bits
T = 1e-6
ck = DigitalClock("clk"); ck.setParams("Freq=1MEG Td=0.5u")
cn = Counter("clk", "t", width=8)
one = DCVoltage("one", "0"); one.setParams("Vdc=5")

els = {"CK": ck, "CN": cn, "ONE": one,
       "MX": Multiplexer(t_(0, 4), t_(4, 6), "mx"),                     # 4:1, data = t0..t3, select = t4,t5
       "DM": Demultiplexer("t[0]", t_(1, 3), ["dm0", "dm1", "dm2", "dm3"]),
       "DC": Decoder(t_(0, 3), ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"], en="t[3]"),
       "PE": PriorityEncoder(t_(0, 8), ["pe0", "pe1", "pe2"], valid="pev"),
       "AD": Adder(t_(0, 4), t_(4, 8), ["s0", "s1", "s2", "s3"], cout="co"),
       "CP": MagnitudeComparator(t_(0, 4), t_(4, 8), gt="gt", eq="eq", lt="lt"),
       "PG": ParityGenerator(t_(0, 8), "par"),
       "BG": BinaryToGray(t_(0, 8), "g", width=8),
       "GB": GrayToBinary("g", "gb", width=8),
       "SS": SevenSegmentDecoder(t_(0, 4), "seg"),
       "RG": Register(t_(0, 4), "clk", ["rq0", "rq1", "rq2", "rq3"]),
       "TF": TFF("one", "clk", "tq"),
       "LF": LFSR("clk", "lf", width=4)}

c = circuit(); c.addElements(els)
c.setOutPuts("CN.Q", "MX.Y", "DM.Y", "DC.Y", "PE.Q", "PE.Valid", "AD.S", "AD.Cout", "CP.Gt", "CP.Eq", "CP.Lt",
             "PG.Y", "BG.G", "GB.B", "SS.Y", "RG.Q", "TF.Q", "LF.Q")
c.analysis(mode="tran", start=0, stop=258 * T, step=20e-9, adaptive=True, order=2, max_step=100e-9, lte=1e-3)
r = c.run(); tt = np.array(r["time"])

def lfsr_ref(n_edges, bits=4, taps=(3, 2), seed=1):
    q, mask, out = seed, sum(1 << b for b in taps), []
    for _ in range(n_edges + 1):
        out.append(q)
        q = ((q << 1) | (bin(q & mask).count("1") & 1)) & ((1 << bits) - 1)
    return out
lf = lfsr_ref(260)
SEG = SevenSegmentDecoder.SEG
refs = {
    "Multiplexer 4:1":        ("MX.Y",   lambda n: ((n & 15) >> ((n >> 4) & 3)) & 1),
    "Demultiplexer 1:4":      ("DM.Y",   lambda n: (n & 1) << ((n >> 1) & 3)),
    "Decoder 3->8 (enable)":  ("DC.Y",   lambda n: (1 << (n & 7)) if (n >> 3) & 1 else 0),
    "PriorityEncoder 8->3":   ("PE.Q",   lambda n: max(n.bit_length() - 1, 0)),
    "  valid output":        ("PE.Valid", lambda n: 1 if n else 0),
    "Adder 4 bit  (sum)":     ("AD.S",   lambda n: ((n & 15) + (n >> 4)) & 15),
    "  carry out":           ("AD.Cout", lambda n: ((n & 15) + (n >> 4)) >> 4),
    "Comparator A>B":         ("CP.Gt",  lambda n: int((n & 15) > (n >> 4))),
    "  A==B":                ("CP.Eq",   lambda n: int((n & 15) == (n >> 4))),
    "  A<B":                 ("CP.Lt",   lambda n: int((n & 15) < (n >> 4))),
    "ParityGenerator 8 bit":  ("PG.Y",   lambda n: bin(n).count("1") & 1),
    "BinaryToGray":           ("BG.G",   lambda n: n ^ (n >> 1)),
    "GrayToBinary (round trip)": ("GB.B", lambda n: n),
    "SevenSegmentDecoder":    ("SS.Y",   lambda n: SEG[n & 15]),
    "Register (D = t[3:0])":  ("RG.Q",   lambda n: (n - 1) & 15),
    "TFF (T = 1, divide by 2)": ("TF.Q", lambda n: n & 1),
    "LFSR 4 bit (period 15)": ("LF.Q",   lambda n: lf[n]),
}
bad_total = 0
print("%-28s %8s" % ("block", "errors / 255 vectors"))
for name, (sig, f) in refs.items():
    bad = 0
    for n in range(1, 256):                                        # after rising edge n the counter holds n
        ts = 0.5 * T + (n - 1) * T + 0.8 * T
        got = int(round(np.interp(ts, tt, r[sig])))
        bad += got != f(n)
    bad_total += bad
    print("%-28s %8d" % (name, bad))
print("total mismatches:", bad_total)
print("LFSR period:", lf[1:].index(1) + 1, "(maximum 2^4 - 1 = 15)")

ink, grid, surf = '#0b0b0b', '#e1e0d9', '#fcfcfb'
n = list(range(1, 64)); ts = [0.5 * T + (k - 1) * T + 0.8 * T for k in n]
fig, ax = plt.subplots(4, 1, figsize=(9.5, 8), sharex=True, facecolor=surf)
for a in ax:
    a.set_facecolor(surf); a.grid(color=grid); a.tick_params(colors=ink)
def plot(a, sig, f, label, color, ref_color):
    a.step(n, [np.interp(x, tt, r[sig]) for x in ts], where="post", color=color, label=label + " (PyAMS)")
    a.plot([k + 0.5 for k in n], [f(k) for k in n], ".", color=ref_color, ms=4, label="reference")
    a.legend(fontsize=7, loc="upper right")
plot(ax[0], "AD.S", refs["Adder 4 bit  (sum)"][1], "Adder sum", '#2a78d6', '#eb6834')
plot(ax[1], "PE.Q", refs["PriorityEncoder 8->3"][1], "PriorityEncoder", '#1baf7a', '#eb6834')
plot(ax[2], "BG.G", refs["BinaryToGray"][1], "Gray code", '#8a63d2', '#eb6834')
plot(ax[3], "LF.Q", refs["LFSR 4 bit (period 15)"][1], "LFSR", '#2a78d6', '#eb6834')
for a, ttl in zip(ax, ["Adder: low nibble + high nibble of the counter", "Priority encoder of the counter value",
                       "Binary -> Gray", "4-bit LFSR (period 15)"]):
    a.set_title(ttl, color=ink, fontsize=9)
ax[3].set_xlabel("clock edge n (counter value)")
fig.tight_layout(); fig.savefig("digital_combinational.png", dpi=130, facecolor=surf)
