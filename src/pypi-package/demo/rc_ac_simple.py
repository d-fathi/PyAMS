#-------------------------------------------------------------------------------
# Name:        RC low-pass: how to use analysis(mode="ac")
# Updated:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#        in o---[ R ]---+---o out
#                       |
#                      [ C ]
#                       |
#                      gnd
# Cut-off frequency  fc = 1 / (2 pi R C) = 1 kHz  for R = 1 kOhm, C = 159.155 nF

import numpy as np
from pyams.lib import circuit
from pyams.models import ACVoltage, Resistor, Capacitor

# 1) elements: the source must be an ACVoltage (Vac = 1 V by default, Vdc = 0 V)
Vin = ACVoltage("in", "0")
R = Resistor("in", "out");   R.setParams("R=1kΩ")
C = Capacitor("out", "0");   C.setParams("C=159.155nF")

# 2) circuit and outputs
cir = circuit()
cir.addElements({"Vin": Vin, "R": R, "C": C})
cir.setOutPuts("out")                      # node "out" (also "C.I", "R.I" ... are possible)

# 3) AC analysis: from 10 Hz to 100 kHz, 20 points per decade
cir.analysis(mode="ac", start=10, stop=100e3, step=20)
res = cir.run()

# 4) results: complex numbers (phasors).  With Vac = 1 V, "out" is the transfer function
f = res["freq"]                            # frequencies (Hz)
H = res["out"]                             # complex  Vout / Vin
mag_db = 20 * np.log10(np.abs(H))          # magnitude in dB
phase = np.degrees(np.angle(H))            # phase in degrees

k = np.argmin(np.abs(f - 1000))            # the point nearest 1 kHz
print("f = %.0f Hz : |H| = %.4f (%.2f dB), phase = %.1f deg" % (f[k], abs(H[k]), mag_db[k], phase[k]))
print("expected at fc: 0.7071 (-3.01 dB), -45 deg")

# the -3 dB frequency from the result (interpolated)
fc = np.interp(-3.0103, mag_db[::-1], f[::-1])
print("-3 dB frequency: %.1f Hz (1/(2 pi R C) = %.1f Hz)" % (fc, 1 / (2 * np.pi * 1e3 * 159.155e-9)))

# 5) Bode plot (magnitude + phase) in one line, or save it to a file
cir.plot("rc_ac_simple.png", show=False)

# Tip: several values of R in the same plot
cir.sweep(param="R.R", list=[500, 1000, 2000])
cir.run()
cir.plot("rc_ac_sweep.png", show=False)
