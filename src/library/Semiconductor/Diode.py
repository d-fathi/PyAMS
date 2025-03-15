#-------------------------------------------------------------------------------
# Name:        Simple Diode
# Author:      d.fathi
# Created:     05/01/2015
# Modified:    18/12/2021
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import signal,model,param
from electrical import voltage,current
from std import explim

#Simple Diode-------------------------------------------------------------------
class  Diode(model):
   def __init__(self, a, b):
        #Signals declarations---------------------------------------------------
        self.V = signal('in',voltage,a,b)
        self.I = signal('out',current,a,b)

        self.Iss=param(1.0e-15,'A','Saturation current')
        self.Vt=param(0.025,'V','Thermal voltage')
        self.n=param(1,' ','The ideality factor');


   def analog(self):
        #Mathematical equation between I and V----------------------------------
        self.I+=self.Iss*(explim(self.V/(self.n*self.Vt))-1)
