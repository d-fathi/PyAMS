#-------------------------------------------------------------------------------
# Name:        smaple digital circuit
# Author:      d.fathi
# Created:     04/04/2025
# Copyright:   (c) pyams 2025
# Licence:     free GPLv3
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model,circuit

# Create digital models---------------------------------------------------------
class AND(model):
    """ Digital AND gate model """
    def __init__(self, In1, In2, Out):
        self.In1 = dsignal(direction='in', port=In1)
        self.In2 = dsignal(direction='in', port=In2)
        self.Out = dsignal(direction='out', port=Out)

    def digital(self):
        """ Perform AND operation """
        self.Out += self.In1 & self.In2


class High(model):
    """ Model for a constant HIGH (1) signal """
    def __init__(self, Out):
        self.Out = dsignal(direction='out', port=Out, value='1')

    def digital(self):
        pass


class Low(model):
    """ Model for a constant LOW (0) signal """
    def __init__(self, Out):
        self.Out = dsignal(direction='out', port=Out, value='0')

    def digital(self):
        pass



# Define circuit components-----------------------------------------------------
A = AND('n1', 'n2', 'n3')
I1 = High('n1')
I2 = Low('n2')

# Create circuit and add components--------------------------------------------
circuit = circuit()
circuit.addElements({'A': A, 'I1': I1, 'I2': I2})

# Set the outputs for plotting
circuit.setOutPuts("n3")

# Perform op analysis and run simulation-------------------------------
circuit.analysis(mode="op")
circuit.print()