#-------------------------------------------------------------------------------
# Name:        InductorIc
# Author:      PyAMS
# Created:     25/06/2015
# Modified:    24/03/2025
# Copyright:   (c) PyAMS
#-------------------------------------------------------------------------------


from pyams_lib import signal,model,param
from pyams_lib import voltage,current
from pyams_lib import ddt


#Inductor model-----------------------------------------------------------------
class InductorIc(model):
    """
    This class implements an Inductor model with an initial current.

    An inductor stores energy in a magnetic field and resists changes in 
    current flow. The voltage across the inductor is proportional to the 
    rate of change of current through it, and this model also accounts for 
    an initial current.

    Attributes:
        Vl (signal): Output voltage signal across the inductor, defined between nodes (p, n).
        Il (signal): Input current signal through the inductor, defined between nodes (p, n).
        L (param): Inductance value in Henrys (H), default is 1.0e-3 H.
        Ic (param): Initial current in Amperes (A), default is 0 A.

    Methods:
        analog(): Defines the inductor behavior using the equation:
                  V = L * dI/dt  and I(t=0)=Ic
    """
    def __init__(self, p, n):
         #Signals declarations--------------------------------------------------
         self.V = signal('out',voltage,p,n)
         self.I = signal('in',current,p,n)
         #Parameter declarations------------------------------------------------
         self.L=param(1.0e-3,'H','Inductor value')
         self.Ic=param(0,'A','Initial charge')

    def analog(self):
         """Defines the inductor's voltage-current relationship with initial current."""
         #V=L*dI/dt-----------------------------------------------------------
         self.V+=self.L*ddt(self.I,self.Ic)
