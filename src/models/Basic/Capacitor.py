#-------------------------------------------------------------------------------
# Name:        Capacitor
# Author:      D.Fathi
# Created:     25/06/2015
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import model,signal,param
from pyams_lib import voltage,current
from pyams_lib import ddt

#Capacitor model----------------------------------------------------------------
class Capacitor(model):
    """
    This class implements a Capacitor model.

    A capacitor stores electrical energy in an electric field and its current 
    is proportional to the rate of change of voltage across it.

    Attributes:
        V (signal): Input voltage signal across the capacitor, defined between nodes (p, n).
        I (signal): Output current signal through the capacitor, defined between nodes (p, n).
        C (param): Capacitance value in Farads (F), default is 1.0e-6 F.

    Methods:
        analog(): Defines the capacitor behavior using the equation:
                  I = C * dV/dt
    """
    def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.V = signal('in',voltage,p,n)
         self.I = signal('out',current,p,n)
        #Parameter declarations-------------------------------------------------
         self.C=param(1.0e-6,'F','Capacitor value')

    def analog(self):
         #Ic=C*dVc/dt-----------------------------------------------------------
         self.I+=self.C*ddt(self.V)


