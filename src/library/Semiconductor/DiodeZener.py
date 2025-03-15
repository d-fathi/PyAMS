#-------------------------------------------------------------------------------
# Name:        Simple Diode zener
# Author:      d.fathi
# Created:     22/12/2021
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from PyAMS import signal,model,param
from electrical import voltage,current
from std import explim


#Simple diode zener
class DiodeZener(model):
     def __init__(self, n, p):
         #Signals declarations--------------------------------------------------
         self.V = signal('in',voltage,n,p)
         self.I = signal('out',current,n,p)

         #Parameter declarations------------------------------------------------
         self.Iss=param(1.0e-12,'A' ,'Saturation current');
         self.Vt=param(0.025,' ','Thermal voltage');
         self.N=param(1.0,' ','Forward emission coefficient');
         self.BV=param(10.0,'V','Breakdown voltage');
         self.IBV=param(0.001,'A','Breakdown current');

     def analog(self):
         #Mathematical equation between I and V---------------------------------
         Id=self.Iss*(explim(self.V/self.Vt)-1)
         Ii=self.IBV*(explim(-(self.V+self.BV)/self.Vt)-1)*-1
         self.I+=Id+Ii;
