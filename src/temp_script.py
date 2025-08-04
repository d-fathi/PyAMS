import json;
from pyams.models import Resistor;
from pyams.models import DCVoltage;
from pyams.models import Resistor;
from pyams.models import Resistor;
from pyams.models import Resistor;
from pyams.models import Resistor;
from pyams.lib import cirCAD;
R2 = Resistor("N04","N01");
V2 = DCVoltage("N04","0");
R3 = Resistor("N05","N01");
R4 = Resistor("N05","N06");
R5 = Resistor("N06","0");
R1 = Resistor("N01","0");
R2.setParams("   R=100KΩ ");
V2.setParams("   Vdc=15.0V ");
R3.setParams("   R=1K ");
R4.setParams("   R=1K ");
R5.setParams("   R=1K ");
R1.setParams("   R=200KΩ ");
circuit = cirCAD();
circuit.addElements({'R2':R2,'V2':V2,'R3':R3,'R4':R4,'R5':R5,'R1':R1})
circuit.setOutPuts("N04")
circuit.analysis(mode='op')
circuit.run();
circuit.getVal()
