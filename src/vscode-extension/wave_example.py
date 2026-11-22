
from pyams.lib import circuit
from pyams.models import DigitalClock, Counter, DFF, Resistor, Capacitor
from pyams.wave import plot_wave

T = 1e-6
ck = DigitalClock("clk"); ck.setParams("Freq=1MEG Duty=0.5 Td=0.5u")
cn = Counter("clk", ["s0", "s1", "s2"])
f0 = DFF("nq0", "clk", "q0", "nq0")
rc = Resistor("q0", "lp"); rc.setParams("R=2KΩ")
cp = Capacitor("lp", "0"); cp.setParams("C=0.5n")

c = circuit()
c.addElements({"CK": ck, "CN": cn, "F0": f0, "RC": rc, "CP": cp})
c.setOutPuts("clk", "q0", "s0", "s1", "s2", "lp")
c.analysis(mode="tran", start=0, stop=20 * T, step=20e-9, adaptive=True, order=2, max_step=40e-9)
r = c.run()

plot_wave(r, [
    "clk",
    ("q0 (/2)", "q0"),
    ("count", ["s0", "s1", "s2"]),              # bus, bit 0 = LSB, hex
    ("count (bin)", ["s0", "s1", "s2"], "bin"),
    ("count (dec)", ["s0", "s1", "s2"], "dec"),
    ("RC of q0", "lp", "analog"),
], vth=2.5, tscale=1e6, tunit="µs", title="plot_wave: bits, bus and analog",
   filename="wave_example.png", show=True)   # show=True -> window

