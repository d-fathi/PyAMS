#-------------------------------------------------------------------------------
# Name:        puls voltage Source
# Author:      d.fathi
# Created:     14/03/2017
# Modified:    12/09/2024
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param, time
from electrical import voltage


#Source for puls voltage-----------------------------------------------------
class PulsVoltage(model):
     def __init__(self, p, n):
         #Signal  declaration--------------------------------------------------
         self.V= signal('out',voltage,p,n)

         #Parameters declarations----------------------------------------------
         self.Va=param(1.0,'V','Amplitude of square wave voltage  ')
         self.T=param(0.1,'Sec','Period')
         self.D=param(50,'%','Duty cycle')
         self.Voff=param(0.0,'V','Offset voltage')

     def analog(self):
         n=time-int(time/self.T)*self.T
  
         if(n<=self.T*self.D/100):
             self.V+=self.Va+self.Voff
         else:
             self.V+=self.Voff


