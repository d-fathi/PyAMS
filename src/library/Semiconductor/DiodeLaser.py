#-------------------------------------------------------------------------------
# Name:        Simple Diode Laser
# Author:      d.fathi
# Created:     20/10/2024
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import signal,model,param
from electrical import voltage,current
from std import explim,ddt

#Simple Diode-------------------------------------------------------------------
class  DiodeLaser(model):
   def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
        self.V = signal('in',voltage,p,n)
        self.I = signal('out',current,p,n)

        self.Iss=param(1.0e-15,'A','Saturation current')
        self.Vt=param(0.025,'V','Thermal voltage')
        self.n=param(1,' ','The ideality factor');
        self.Rth=param(10,'Ω','Rthermal anode cathode ');
        self.Cj=param(1e-9,'F','Cjunction anode cathode ');



   def analog(self):
        #Mathematical equation between I and V----------------------------------
        self.I+=self.Iss*(explim(self.V/(self.n*self.Vt))-1)+self.Rth*self.V+self.Cj*ddt(self.V)
