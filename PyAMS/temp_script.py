import json;
from models import Resistor;
from models import Resistor;
from models import DCVoltage;
from pyams_lib import cirCAD;
R1 = Resistor("Out","0");
R2 = Resistor("In","Out");
V1 = DCVoltage("In","0");
R1.setParams(" Pout=1KΩ  R=100Ω   ");
R2.setParams(" Pout=1KΩ  R=100Ω   ");
V1.setParams("   Vdc=35.0V ");
circuit = cirCAD();
circuit.addElements({'R1':R1,'R2':R2,'V1':V1})
circuit.setOutPuts("Out")
circuit.analysis(mode='op')
circuit.run();
circuit.getVal()
