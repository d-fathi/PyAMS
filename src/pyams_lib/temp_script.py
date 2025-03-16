import sys;
import json;
sys.path.append('D:\project\PyAMS\pyams_lib');
sys.path.append('D:\project\PyAMS\library\Basic');
sys.path.append('D:\project\PyAMS\library\Source');
sys.path.append('D:\project\PyAMS\library\Semiconductor');
sys.path.append('D:\project\PyAMS\library\Digital');
from PyAMS import time,circuit
from DiodeBridge import DiodeBridge;
from SinVoltage import SinVoltage;
from Resistor import Resistor;
from Resistor import Resistor;
from Capacitor import Capacitor;
from Transformer import Transformer;

D1 = DiodeBridge("sec","Out","N05","0");
V1 = SinVoltage("In","0");
R1 = Resistor("In","N01");
R2 = Resistor("Out","0");
C1 = Capacitor("Out","0");
T2 = Transformer("N01","0","sec","N05");
D1.setParams("   ");
V1.setParams("   Va=120V Fr=60Hz ");
R1.setParams("   R=10mΩ  ");
R2.setParams("   R=1KΩ  ");
C1.setParams("   C=0.1mF ");
T2.setParams("   Lp=1H Ls=1H M=1H ");

circuit = circuit();
circuit.addElements({'D1':D1,'V1':V1,'R1':R1,'R2':R2,'C1':C1,'T2':T2})


# Set outputs for plotting;
circuit.setOutPuts("In","Out");


# Set outputs for plotting;
circuit.analysis(mode="tran",start=0,stop=0.04,step=0.0003);
circuit.run();
circuit.plot();