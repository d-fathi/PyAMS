#-------------------------------------------------------------------------------
# Name:        Inductor
# Author:      PyAMS
# Created:     25/06/2015
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------

from pyams_lib import signal,model,param
from pyams_lib import voltage,current
from pyams_lib import ddt


#Inductor model-----------------------------------------------------------------
class Inductor(model):
    """
    This class implements an Inductor model.

    An inductor stores energy in a magnetic field and resists changes in 
    current flow. The voltage across the inductor is proportional to the 
    rate of change of current through it.

    Attributes:
        V (signal): Output voltage signal across the inductor, defined between nodes (p, n).
        I (signal): Input current signal through the inductor, defined between nodes (p, n).
        L (param): Inductance value in Henrys (H), default is 1.0e-3 H.

    Methods:
        analog(): Defines the inductor behavior using the equation:
                  V = L * dI/dt
    """
    def __init__(self, p, n):
         #Signals declarations--------------------------------------------------
         self.V = signal('out',voltage,p,n)
         self.I = signal('in',current,p,n)
         #Parameter declarations------------------------------------------------
         self.L=param(1.0e-3,'H','Inductor value')

    def analog(self):
         """Defines the inductor's voltage-current relationship using Faraday's Law."""
         #V=L*dI/dt-----------------------------------------------------------
         self.V+=self.L*ddt(self.I)

