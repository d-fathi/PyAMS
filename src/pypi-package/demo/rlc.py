#-------------------------------------------------------------------------------
# Name:        Series RLC circuit (inductor example)
# Author:      d.fathi
# Created:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
#
#   In ──[ R1 ]──( L1 )── Out
#   (V1)                   │
#                        [ C1 ]
#                          │
#                         gnd
#
# A 5 V pulse drives a series R-L-C circuit.  R = 50 ohm is below the critical
# value 2*sqrt(L/C) = 200 ohm, so the capacitor voltage overshoots and rings at
# about f0 = 1/(2*pi*sqrt(L*C)) = 1.59 kHz, decaying with tau = 2L/R = 0.4 ms.
# The first peak reaches 5 V * (1 + exp(-pi*alpha/wd)) = 7.22 V (simulation: 7.23 V).


from pyams.lib import circuit
from pyams.models import Resistor, Inductor, Capacitor, TrapezoidVoltage

# Define elements
V1 = TrapezoidVoltage("In", "0")
R1 = Resistor("In", "N1")
L1 = Inductor("N1", "Out")
C1 = Capacitor("Out", "0")

# Set element parameters
R1.setParams("R=50Ω")
L1.setParams("L=10mH")
C1.setParams("C=1uF")
V1.setParams("V0=0V V1=5V Td=0.1ms Tr=1us Tw=3ms Tf=1us T=10ms")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"V1": V1, "R1": R1, "L1": L1, "C1": C1})

# Set output for plotting
circuit.setOutPuts("In", "Out")

# Perform transient analysis
circuit.analysis(mode="tran", start=0, stop=0.006, step=1e-6,
                 adaptive=True, order=2)
circuit.run()
circuit.plot(filename="rlc_result.png", show=False)
