#-------------------------------------------------------------------------------
# Name:        Op-amp astable multivibrator (relaxation oscillator)
# Author:      d.fathi
# Created:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
#
#          ┌────────[ R ]────────┐
#          │                     │
#          N ──(-)\              │
#          │       >──────┬──────┴── Out        R1 = 35 kΩ, R2 = 30 kΩ
#        [ C ]  ┌─(+)/    │                    β = R2/(R1+R2) = 0.462
#          │    P       [ R1 ]
#         gnd   ├────────┘
#               │
#             [ R2 ]
#               │
#              gnd
#
# The output saturates at +Vcc or -Vcc.  The divider R1/R2 feeds back a fraction
# β of the output to the (+) input, which sets the switching thresholds
# ±β·Vsat, and R charges / discharges C towards the output.  Each time the
# capacitor voltage crosses a threshold the output flips, so
#
#     T = 2·R·C·ln((1 + β) / (1 - β))      (= 2RC for β = 0.462, since ln(e) = 1)
#     f = 1 / T = 1 kHz  for R = 50 kΩ, C = 0.01 µF
#
# The 1 mV input offset of the op-amp starts the oscillation (an ideal
# symmetric circuit stays at its unstable balance point at 0 V).


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, OpAmp

# Define elements
U1 = OpAmp("P", "N", "Out")            # (+, -, output)
R = Resistor("Out", "N")
C = Capacitor("N", "0")
R1 = Resistor("Out", "P")
R2 = Resistor("P", "0")

# Set element parameters
U1.setParams("Vcc=12V Vee=-12V Vos=1mV")
R.setParams("R=50KΩ")
C.setParams("C=0.01uF")
R1.setParams("R=35KΩ")
R2.setParams("R=30KΩ")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"U1": U1, "R": R, "C": C, "R1": R1, "R2": R2})

# Set output for plotting
circuit.setOutPuts("Out", "N", "P")

# Perform transient analysis (5 periods)
circuit.analysis(mode="tran", start=0, stop=0.005, step=1e-6,
                 adaptive=True, order=2, uic=True, progress=True)
circuit.run()
circuit.plot(filename="opamp_multivibrator_result.png", show=False)
