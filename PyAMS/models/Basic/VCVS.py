#-------------------------------------------------------------------------------
# Name:        VCVS
# Author:      d.fathi
# Created:     10/03/2017
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import model,signal,param
from pyams_lib  import voltage


#Voltage-controlled voltage source Model----------------------------------------
class VCVS(model):
    """
    This class implements a Voltage-Controlled Voltage Source (VCVS) model.

    A VCVS is an ideal voltage amplifier where the output voltage is proportional 
    to the input voltage, scaled by a gain factor.

    Attributes:
        Vin (signal): Input voltage signal, defined between nodes (p1, n1).
        Vout (signal): Output voltage signal, defined between nodes (p2, n2).
        G (param): Gain multiplier, default value is 1.0.
    
    Methods:
        analog(): Defines the relationship between input and output voltage:
                  Vout = G * Vin
    """
    def __init__(self,p1,n1,p2,n2):
        #Signals declarations---------------------------------------------------
         self.Vin = signal('in',voltage,p1,n1)
         self.Vout = signal('out',voltage,p2,n2)
        #Parameter declarations-------------------------------------------------
         self.G=param(1.0,' ','Gain multiplier')

    def analog(self):
         """Defines the voltage transformation based on the gain G."""
         self.Vout+=self.G*self.Vin


