import sys;
import json;
sys.path.append('D:\project\PyAMS\pyams_lib');
sys.path.append('D:\project\PyAMS\library\Basic');
sys.path.append('D:\project\PyAMS\library\Source');
sys.path.append('D:\project\PyAMS\library\Semiconductor');
sys.path.append('D:\project\PyAMS\library\Digital');
from PyAMS import time;
from Resistor import Resistor;
from Resistor import Resistor;
from DCVoltage import DCVoltage;
from CCVS import CCVS;
from cad import cirCAD;
R1 = Resistor("N02","N01");
R1 = Resistor("N04","0");
V2 = DCVoltage("N02","0");
C1 = CCVS("0","0","N04","0");
R1.setParams("   R=100Ω  ");
R1.setParams("   R=1KΩ  ");
V2.setParams("   Vdc=15.0V ");
C1.setParams("   G=1 ");
circuit = cirCAD();
circuit.addElements({'R1':R1,'R1':R1,'V2':V2,'C1':C1})
circuit.setOutPuts("N01")
circuit.analysis(mode='op')
circuit.run();
circuit.getVal()
