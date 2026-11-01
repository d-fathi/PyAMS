#-------------------------------------------------------------------------------
# Name:        Half wave rectification circuit
# Author:      d.fathi
# Created:     28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from pyams.lib import circuit
from pyams.models  import Resistor, SinVoltage, Diode

# Define elements
R1 = Resistor("Out", "0")
V1 = SinVoltage("In", "0")
D1 = Diode("In", "Out")

# Set element parameters
R1.setParams("R=1KΩ")
V1.setParams("Va=10V Fr=2Hz")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"R1": R1, "V1": V1, "D1": D1})

# Set output for plotting
circuit.setOutPuts("In", "Out")

# Perform transient analysis
circuit.analysis(mode="tran", start=0, stop=2, step=0.001)
circuit.run()
circuit.plot()