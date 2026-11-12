# ADC and DAC (4 bits): a Counter drives a DAC (staircase), an ADC samples a sine wave and a DAC
# rebuilds it from the codes; the analog output then goes through an RC low-pass filter.
# The converters use dsignal buses (width = number of bits: nodes c[0] .. c[3]); at the end the
# same chain is run with 8 bits.
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DigitalClock, Counter, DAC, ADC, SinVoltage, Resistor, Capacitor

N = 4; LSB = 5.0 / 2**N
Tck = 1e-6
# --- 1) counter -> DAC: 16-level staircase
ck = DigitalClock("clk"); ck.setParams("Freq=1MEG Td=0.5u")
cn = Counter("clk", "c", width=N)                  # bus c[0..N-1]
dac = DAC("c", "stair", width=N)
c = circuit(); c.addElements({"CK": ck, "CN": cn, "DAC": dac}); c.setOutPuts("stair", "CN.Q")
c.analysis(mode="tran", start=0, stop=34 * Tck, step=20e-9, adaptive=True, order=2, max_step=50e-9, lte=1e-3)
r1 = c.run(); t1 = np.array(r1["time"])
lv = [np.interp((k + 1.0) * Tck, t1, r1["stair"]) for k in range(33)]          # just before the next edge (after the rise of edge k)
exp = [(k + 1) % 16 * LSB for k in range(33)]
print("1) counter -> DAC: staircase levels vs code x LSB (LSB = %.4f V): max error %.2e V, steps of %.4f V" % (LSB, np.max(np.abs(np.array(lv) - np.array(exp))), np.mean(np.diff(lv[:15]))))

# --- 2) ADC samples a 25 kHz sine (2.5 V + 2.2 V) every microsecond; second DAC rebuilds it
sine = SinVoltage("ain", "0"); sine.setParams("Voff=2.5 Va=2.2 Fr=25k")
ck2 = DigitalClock("sclk"); ck2.setParams("Freq=1MEG Td=0.5u")
adc = ADC("ain", "sclk", "d", width=N)             # bus d[0..N-1]
dac2 = DAC("d", "rec", width=N)
rr = Resistor("rec", "flt"); rr.setParams("R=1KΩ")
cf = Capacitor("flt", "0"); cf.setParams("C=100pF")                        # RC = 100 ns: smooths the staircase
c = circuit(); c.addElements({"S": sine, "CK": ck2, "A": adc, "D": dac2, "R": rr, "C": cf})
c.setOutPuts("ain", "rec", "flt", "A.D")
c.analysis(mode="tran", start=0, stop=60e-6, step=20e-9, adaptive=True, order=2, max_step=50e-9, lte=1e-3)
r2 = c.run(); t2 = np.array(r2["time"])
edges = 0.5e-6 + Tck * np.arange(0, 59)
vin = np.interp(edges, t2, r2["ain"])
code_exp = np.clip(np.floor(vin / 5.0 * 2**N), 0, 2**N - 1)
code_got = np.array([np.interp(e + 0.2e-6, t2, r2["A.D"]) for e in edges])
err = code_got - code_exp
print("2) ADC: %d samples, %d equal to floor(Vin/Vref 2^N), max |difference| = %d LSB" % (len(edges), int(np.sum(err == 0)), int(np.max(np.abs(err)))))
rec = np.array([np.interp(e + 0.5e-6, t2, r2["rec"]) for e in edges])
print("   reconstruction (ADC -> DAC): max |V_rec - V_in| = %.3f V (1 LSB = %.4f V, ADC floors so the mean offset is -LSB/2 = %.4f)" %
      (np.max(np.abs(rec - vin)), LSB, np.mean(rec - vin)))

# --- 3) the same chain with 8 bits: only the width changes
M = 8; LSB8 = 5.0 / 2**M
ck3 = DigitalClock("sclk"); ck3.setParams("Freq=1MEG Td=0.5u")
adc8 = ADC("ain", "sclk", "e", width=M); dac8 = DAC("e", "rec8", width=M)
c = circuit(); c.addElements({"S": SinVoltage("ain", "0"), "CK": ck3, "A": adc8, "D": dac8})
c.elements["S"].setParams("Voff=2.5 Va=2.2 Fr=25k")
c.setOutPuts("ain", "rec8", "A.D")
c.analysis(mode="tran", start=0, stop=60e-6, step=20e-9, adaptive=True, order=2, max_step=50e-9, lte=1e-3)
r3 = c.run(); t3 = np.array(r3["time"])
vin8 = np.interp(edges, t3, r3["ain"])
cexp8 = np.clip(np.floor(vin8 / 5.0 * 2**M), 0, 2**M - 1)
cgot8 = np.array([np.interp(e + 0.2e-6, t3, r3["A.D"]) for e in edges])
rec8 = np.array([np.interp(e + 0.5e-6, t3, r3["rec8"]) for e in edges])
print("3) 8 bits (LSB = %.2f mV): %d of %d codes equal to floor(Vin/Vref 2^N), max |V_rec - V_in| = %.2f mV (<= 1 LSB)" %
      (1e3 * LSB8, int(np.sum(cgot8 == cexp8)), len(edges), 1e3 * np.max(np.abs(rec8 - vin8))))

# --- figure
fig, ax = plt.subplots(2, 1, figsize=(10, 7), facecolor="#fcfcfb")
ax[0].plot(t1 * 1e6, r1["stair"], color="#2a78d6", lw=1.6); ax[0].set_ylabel("DAC out (V)"); ax[0].set_title("Counter -> 4-bit DAC: 16-level staircase", loc="left")
ax[1].plot(t2 * 1e6, r2["ain"], color="#0b0b0b", lw=1, label="analog input"); ax[1].plot(t2 * 1e6, r2["flt"], color="#eb6834", lw=1.4, label="ADC -> DAC -> RC")
ax[1].step(edges * 1e6 + 0.0, code_got * LSB, where="post", color="#2a78d6", lw=.8, label="code x LSB")
ax[1].set_xlabel("t (us)"); ax[1].set_ylabel("V"); ax[1].legend(frameon=False, ncol=3, loc="upper right"); ax[1].set_title("4-bit ADC samples a 25 kHz sine at 1 MHz", loc="left")
for a in ax:
    a.set_facecolor("#fcfcfb"); a.grid(color="#e1e0d9", lw=.6)
    for s in ("top", "right"): a.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig("digital_adc_dac.png", dpi=140)
