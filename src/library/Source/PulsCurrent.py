#-------------------------------------------------------------------------------
# Name:        Puls current Source
# Author:      d.fathi
# Created:     14/03/2017
# Modified:    12/09/2024
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param, time
from electrical import current

#Source for puls current--------------------------------------------------------
class PulsCurrent(model):
     def __init__(self, p, n):
         #Signal  declaration---------------------------------------------------
         self.I = signal('out',current,p,n)

         #Parameters declarations-----------------------------------------------
         self.Ia=param(1.0,'A','Amplitude of square wave current  ')
         self.T=param(0.1,'Sec','Period')
         self.D=param(50,'%','Duty cycle')
         self.Ioff=param(0.0,'A','Offset current')


     def analog(self):
         n=time-int(time/self.T)*self.T
  
         if(n<=self.T*self.D/100):
             self.I+=self.Ia+self.Ioff
         else:
             self.I+=self.Ioff
