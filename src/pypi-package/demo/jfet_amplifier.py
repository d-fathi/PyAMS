#-------------------------------------------------------------------------------
# Name:        JFET common-source amplifier (self bias)
# Author:      d.fathi
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
#
#                         Vdd (12 V)
#                          │
#                        [ RD 4.7k ]
#                          │
#            Cin           ├──── Cout ──── Out
#   Vin ──────||───── G ──┤D
#   (1 kHz)    1uF     │   J1  (N-channel)
#                    [RG]   S
#                    1M │   │
#                      gnd  ├── [ RS 1k ] ── gnd
#                           │
#                          [ CS 100uF ]  (bypass)
#                           │
#                          gnd
#
# The gate draws no current, so RG holds it at 0 V and the drain current Id
# makes the source rise by Id·RS: the gate-source voltage is negative
# (Vgs = -Id·RS), the bias a JFET needs, with a single supply (self bias).
#
# With Beta = 0.5 mA/V², Vto = -2 V:   Id = Beta (Vgs - Vto)²   and   Vgs = -Id RS
#     (with Lambda = 0.01:  Id = 0.789 mA, Vgs = -0.789 V, VD = 12 - Id RD = 8.29 V)
# Small-signal gain (CS short-circuits RS at 1 kHz):  Av = -gm (RD || RL || ro),
#     gm = 2 Beta (Vgs - Vto)(1 + Lambda Vds) = 1.30 mS  ->  Av ≈ -5.7 (inverting).


from pyams.lib import circuit
from pyams.models import Resistor, Capacitor, DCVoltage, SinVoltage, JFET

# Define elements
Vdd = DCVoltage("Vdd", "0")
Vin = SinVoltage("Vs", "0")
Cin = Capacitor("Vs", "G")
RG = Resistor("G", "0")
RD = Resistor("Vdd", "D")
RS = Resistor("S", "0")
CS = Capacitor("S", "0")
Cout = Capacitor("D", "Out")
RL = Resistor("Out", "0")
J1 = JFET("D", "G", "S")               # (drain, gate, source)

# Set element parameters
Vdd.setParams("Vdc=12V")
Vin.setParams("Va=0.2V Fr=1kHz")
Cin.setParams("C=1uF")
RG.setParams("R=1MΩ")
RD.setParams("R=4.7KΩ")
RS.setParams("R=1KΩ")
CS.setParams("C=100uF")
Cout.setParams("C=10uF")
RL.setParams("R=100KΩ")
J1.setParams("Beta=0.5m Vto=-2V Lambda=0.01")

# Create circuit and add elements
circuit = circuit()
circuit.addElements({"Vdd": Vdd, "Vin": Vin, "Cin": Cin, "RG": RG, "RD": RD,
                     "RS": RS, "CS": CS, "Cout": Cout, "RL": RL, "J1": J1})

# Set output for plotting
circuit.setOutPuts("Vs", "Out")

# Perform transient analysis (5 periods, after the bias is established)
circuit.analysis(mode="tran", start=0, stop=0.005, step=1e-5,
                 adaptive=True, order=2)
circuit.run()
circuit.plot(filename="jfet_amplifier_result.png", show=False)
