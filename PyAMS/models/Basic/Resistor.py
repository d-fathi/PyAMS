#-------------------------------------------------------------------------------
# Name:        Resistor
# Author:      d.fathi
# Created:     20/03/2015
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import model,signal,param
from pyams_lib import voltage,current

#Resistor Model-----------------------------------------------------------------
class Resistor(model):
    """
    This class implements a Resistor model.

    A resistor limits current flow according to Ohm's Law, which states that 
    the current through a resistor is proportional to the voltage across it 
    and inversely proportional to its resistance.

    Attributes:
        V (signal): Input voltage signal across the resistor, defined between nodes (p, n).
        I (signal): Output current signal through the resistor, defined between nodes (p, n).
        R (param): Resistance value in Ohms (Ω), default is 1000 Ω.

    Methods:
        analog(): Defines the resistor behavior using Ohm's Law:
                  I = V / R
    """
    def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
        self.V = signal('in',voltage,p,n)
        self.I = signal('out',current,p,n)

        #Parameters declarations------------------------------------------------
        self.R=param(1000.0,'Ω','Resistance')
        self.Pout=param(1000.0,'Ω','Resistance')

    def analog(self):
        """Defines the resistor's current-voltage relationship using Ohm's Law."""
        #Resistor equation-low hom (Ir=Vr/R)------------------------------------
        self.I+=self.V/self.R
