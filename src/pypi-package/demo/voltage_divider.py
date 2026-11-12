#-------------------------------------------------------------------------------
# Name:        Voltage divider with a constant voltage source
# Updated:     17/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#   In ──[ R1 ]── Out ──[ R2 ]── gnd
#   (V1)
#
# V1 is a 12 V DC source.  With R1 = 2 kΩ and R2 = 1 kΩ the output is
# Out = 12 * R2 / (R1 + R2) = 4 V.


from pyams.lib import circuit
from pyams.models import Resistor, DCVoltage

# Define elements
V1 = DCVoltage("In", "0")
R1 = Resistor("In", "Out")
R2 = Resistor("Out", "0")

# Set element parameters
V1.setParams("Vdc=12V")
R1.setParams("R=2KΩ")
R2.setParams("R=1KΩ")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"V1": V1, "R1": R1, "R2": R2})

# Set output for plotting
circuit.setOutPuts("In", "Out")

# Perform a DC operating-point analysis
circuit.analysis(mode="dc")
circuit.run()
print("V(In)  = %.4f V" % circuit.results["In"][0])
print("V(Out) = %.4f V   (expected 4 V)" % circuit.results["Out"][0])
