
from PyAMS import time,circuit
from Resistor import Resistor;
#from SquareVoltage import SquareVoltage;
from Inductor import Inductor;
from models import DCVoltage;

R1 = Resistor("Vin","Vout");
V1 = DCVoltage("Vin","0");
L1 = Inductor("Vout","0");
R1.setParams("   R=100 ");
V1.setParams("   Vdc=15 ");
L1.setParams("   L=100 ");
circuit = circuit();
circuit.addElements({'R1':R1,'V1':V1,'L1':L1})

# Set outputs for plotting;
circuit.setOutPuts("Vin","Vout");

# Set outputs for plotting;
circuit.analysis(mode="tran",start=0,stop=0.01,step=0.001);
circuit.run();
circuit.plot();