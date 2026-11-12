#-------------------------------------------------------------------------------
# Name:        Charge and discharge of a capacitor (RC circuit)
# Updated:     15/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#   In ──[ R1 ]── Out
#   (V1)           │
#                [ C1 ]
#                  │
#                 gnd
#
# V1 is a trapezoidal pulse: while it is high the capacitor charges through R1,
# while it is low the capacitor discharges through R1 (time constant R*C = 1 ms).


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, TrapezoidVoltage

# Define elements
V1 = TrapezoidVoltage("In", "0")
R1 = Resistor("In", "Out")
C1 = Capacitor("Out", "0")

# Set element parameters
R1.setParams("R=1KΩ")
C1.setParams("C=1uF")
V1.setParams("V0=0V V1=5V Td=1ms Tr=10us Tw=5ms Tf=10us T=10ms")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"V1": V1, "R1": R1, "C1": C1})

# Set output for plotting
circuit.setOutPuts("In", "Out")

# Perform transient analysis (two charge/discharge cycles).
# adaptive=True / order=2: the solver chooses its own step (small on the pulse
# edges, large in between); `step` is only the spacing of the output points.
circuit.analysis(mode="tran", start=0, stop=0.021, step=1e-6,
                 adaptive=True, order=2)
circuit.run()
circuit.plot()
