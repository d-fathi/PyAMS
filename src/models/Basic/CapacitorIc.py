#-------------------------------------------------------------------------------
# Name:        Capacitor with initial charge
# Author:        PyAMS
# Created:     16/01/2024
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import model,signal,param
from pyams_lib import voltage,current
from pyams_lib import ddt


#Capacitor with initial charge (Ic) model----------------------------------------------------------------
class CapacitorIc(model):
    """
    This class implements a Capacitor model with an initial charge.

    A capacitor stores electrical energy in an electric field, and its current 
    is proportional to the rate of change of voltage across it. This model also 
    accounts for an initial charge.

    Attributes:
        V (signal): Input voltage signal across the capacitor, defined between nodes (p, n).
        I (signal): Output current signal through the capacitor, defined between nodes (p, n).
        C (param): Capacitance value in Farads (F), default is 1.0e-6 F.
        Ic (param): Initial charge in volts (V), default is 0V.

    Methods:
        analog(): Defines the capacitor behavior using the equation:
                  I = C * dV/dt  for V(t=0)=Ic
    """
    def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.V = signal('in',voltage,p,n)
         self.I = signal('out',current,p,n)
        #Parameter declarations-------------------------------------------------
         self.C=param(1.0e-6,'F','Capacitor value')
         self.Ic=param(0,'V','Initial charge')

    def analog(self):
         """Defines the capacitor's current-voltage relationship with initial charge."""
         #Ic=C*dVc/dt-----------------------------------------------------------
         self.I+=self.C*ddt(self.V,self.Ic)


