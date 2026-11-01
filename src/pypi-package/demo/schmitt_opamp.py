#-------------------------------------------------------------------------------
# Name:        Schmitt trigger with an op-amp (inverting)
# Created:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
#
#   Vin ── In ──(-)\
#                    >────┬──── Out        R1 = 30 kΩ, R2 = 10 kΩ
#            ┌────(+)/     │                β = R2/(R1+R2) = 0.25
#            P            [R1]
#            ├────────────┘
#          [R2]
#            │
#           gnd
#
# Positive feedback through R1/R2 gives the (+) input the voltage β·Out.  Out is
# at +Vsat or -Vsat, so the switching thresholds are
#
#     UTP = +β·Vsat   (input rising: Out falls)   ≈ +3 V
#     LTP = -β·Vsat   (input falling: Out rises)  ≈ -3 V
#
# and the circuit is inverting: a high input gives a low output.


from pyams.lib import circuit
from pyams.models import Resistor, SinVoltage, OpAmp

# Define elements
Vin = SinVoltage("In", "0")
U1 = OpAmp("P", "In", "Out")           # (+, -, output)
R1 = Resistor("Out", "P")
R2 = Resistor("P", "0")

# Set element parameters
Vin.setParams("Va=5V Fr=100Hz Ph=-90")    # starts at -5 V
U1.setParams("Vcc=12V Vee=-12V")
R1.setParams("R=30KΩ")
R2.setParams("R=10KΩ")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"Vin": Vin, "U1": U1, "R1": R1, "R2": R2})

# Set output for plotting
circuit.setOutPuts("In", "Out")

# Perform transient analysis (3 periods)
circuit.analysis(mode="tran", start=0, stop=0.03, step=1e-5,
                 adaptive=True, order=2, progress=True)
circuit.run()
circuit.plot(filename="schmitt_opamp_result.png", show=False)


# ---- Input / output relation (transfer characteristic) ---------------------------
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

vin = np.asarray(circuit.results["In"])
vout = np.asarray(circuit.results["Out"])
mid = 0.5 * (vout.max() + vout.min())
hi = vout > mid
sw = np.where(hi[1:] != hi[:-1])[0]
utp = np.mean([vin[k] for k in sw if not hi[k + 1]])   # input rising  -> Out falls
ltp = np.mean([vin[k] for k in sw if hi[k + 1]])       # input falling -> Out rises

surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, ax = plt.subplots(figsize=(7, 4.6), facecolor=surface)
ax.set_facecolor(surface)
ax.plot(vin, vout, color='#2a78d6', linewidth=2)
ax.set_xlabel('Input voltage Vin (V)', color=ink2)
ax.set_ylabel('Output voltage Out (V)', color=ink2)
ax.set_title('Op-amp Schmitt trigger: Out versus Vin', loc='left', color=ink, fontsize=12)
ax.grid(color=grid, linewidth=0.8); ax.set_axisbelow(True)
for side in ('top', 'right'):
    ax.spines[side].set_visible(False)
for side in ('left', 'bottom'):
    ax.spines[side].set_color(axis_c)
ax.tick_params(colors=ink2)
lo_v, hi_v = vout.min(), vout.max()
for x, lab, ha in ((ltp, 'LTP = %.2f V' % ltp, 'right'), (utp, 'UTP = %.2f V' % utp, 'left')):
    ax.axvline(x, color='#898781', linestyle='--', linewidth=1)
    ax.text(x + (0.1 if ha == 'left' else -0.1), 0.0, lab, ha=ha, va='center',
            color=ink2, fontsize=10)
ax.annotate('', xy=(utp - 1.0, hi_v), xytext=(utp - 2.5, hi_v),
            arrowprops=dict(arrowstyle='->', color=ink2))
ax.annotate('', xy=(ltp + 1.0, lo_v), xytext=(ltp + 2.5, lo_v),
            arrowprops=dict(arrowstyle='->', color=ink2))
fig.tight_layout()
fig.savefig("schmitt_opamp_transfer.png", dpi=150, facecolor=surface)
print("UTP = %.3f V, LTP = %.3f V, expected +-%.3f V (beta*Vsat), Out = %.2f / %.2f V"
      % (utp, ltp, 0.25 * hi_v, lo_v, hi_v))
