import sys;
import json;
sys.path.append('D:\project\PyAMS\pyams_lib');
sys.path.append('D:\project\PyAMS\library\Basic');
sys.path.append('D:\project\PyAMS\library\Source');
sys.path.append('D:\project\PyAMS\library\Semiconductor');
sys.path.append('D:\project\PyAMS\library\CMOSGates');
from PyAMS import time;
from models import Resistor;
from models import SinVoltage;
from models import Diode;
from pyams_lib import cirCAD;
R1 = Resistor("Out","0");
V1 = SinVoltage("In","0");
D1 = Diode("In","Out");
R1.setParams("   R=1KΩ ");
V1.setParams("   Va=10V Fr=2Hz ");
D1.setParams("   ");
circuit = cirCAD();
circuit.addElements({'R1':R1,'V1':V1,'D1':D1})


# Set outputs for plotting;
circuit.setOutPuts("In","Out");


# Set outputs for plotting;
circuit.analysis(mode="tran",start=0,stop=2,step=0.001);
circuit.run();
circuit.result();