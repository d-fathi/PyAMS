#-------------------------------------------------------------------------------
# Name:        Tracking ADC (closed analog/digital loop)
# Author:      d.fathi
# Created:     18/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
# Mixed-signal loop:  Vin --> Comparator --> up/down counter (dsignal) --> 6-bit DAC --> Vdac
#                       ^________________________________________________________|
# The counter goes up while Vin > Vdac and down otherwise, so the 6-bit code follows the
# analog input (tracking ADC).  All of it is solved together: analog MNA + digital events.
import numpy as np
from pyams.lib import circuit, model, dsignal
from pyams.models import SinVoltage, DigitalClock, Comparator, DAC
from pyams.wave import plot_wave

class UpDown(model):
    """N-bit counter: on the rising clock edge +1 when Up = 1, -1 otherwise (saturates)."""
    def __init__(self, clk, up, q, width=6):
        self.Clk = dsignal('in', clk)
        self.Up = dsignal('in', up)
        self.Q = dsignal('out', q, width=width, init=1 << (width - 1))
        self.top = (1 << width) - 1

    def digital(self):
        if self.Clk.rising:
            if self.Up.value and self.Q.value < self.top:
                self.Q <<= self.Q + 1
            elif not self.Up.value and self.Q.value > 0:
                self.Q <<= self.Q - 1

T = 1e-6                                              # 1 MHz clock
vin = SinVoltage("vin", "0"); vin.setParams({'Voff': 2.5, 'Va': 2.0, 'Fr': 5e3})
ck = DigitalClock("clk"); ck.setParams("Freq=1MEG Duty=0.5 Td=0.5u")
cmp_ = Comparator("vin", "vdac", "up")
ud = UpDown("clk", "up", "q", width=6)                # nodes q[0] ... q[5]
dac = DAC("q", "vdac", width=6)

c = circuit()
c.addElements({"VIN": vin, "CK": ck, "CMP": cmp_, "UD": ud, "DAC": dac})
c.setOutPuts("clk", "up", "vin", "vdac", *["q[%d]" % i for i in range(6)])
c.analysis(mode="tran", start=0, stop=200 * T, step=20e-9, adaptive=True, order=2, max_step=50e-9,progress=True)
r = c.run()

t = np.array(r["time"]); m = t > 50 * T              # after the lock-in
err = np.interp(t, t, np.array(r["vin"]) - np.array(r["vdac"]))
print("accepted steps: %d  rejected: %d" % (c.stats["accepted"], c.stats["rejected"]))
print("LSB = %.1f mV;  |Vin - Vdac| after lock: max %.1f mV (about 2 LSB expected)" %
      (5e3 / 64, 1e3 * np.abs(err[m]).max()))
code = sum((np.array(r["q[%d]" % i]) > 2.5).astype(int) << i for i in range(6))
print("code range after lock: %d ... %d (ideal 0.5/5*64=%d ... 4.5/5*64=%d)" %
      (code[m].min(), code[m].max(), 0.5 / 5 * 64, 4.5 / 5 * 64))

plot_wave(r, [
    "clk",
    ("up (cmp)", "up"),
    ("code", ["q[%d]" % i for i in range(6)], "dec"),
    ("Vin, Vdac", ["vin", "vdac"], "analog"),
], vth=2.5, tscale=1e6, tunit="µs", tlim=(60, 100), title="Tracking ADC: comparator + up/down counter + DAC",
   filename="tracking_adc.png", show=True)
