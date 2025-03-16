#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      dhiab fathi
#
# Created:     26/02/2025
# Copyright:   (c) dhiab fathi 2025
# Licence:     <your licence>
#-------------------------------------------------------------------------------


from models import circuit,Resistor,SinVoltage,Diode;
from cad import cirCAD;

# construite elements
V1=SinVoltage('n1', '0')
D1=Diode('n1', 'n2')
R1=Resistor('n2', '0')

myCircuit = cirCAD()

# Add elements to the circuit
myCircuit.addElements({'V1': V1,'D1': D1,'R1': R1});

# Set outputs for plotting
myCircuit.setOutPuts(D1.V,R1.V)

# Modify parameters of an element
V1.setParams("Va=10 Ph=0 Voff=0")

#Perform transient analysis
myCircuit.analysis(mode='tran',start=0.0,step=0.005,stop=5)
myCircuit.run()

print('\n')
#print the results
myCircuit.plot()