#-------------------------------------------------------------------------------
# Name:        Sine wave Voltage
# Author:      D.Fathi
# Created:     20/03/2015
# Modified:    30/10/2021
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import signal, param, model, time
from electrical import current
from math  import sin, pi

#Sine wave Voltage  source------------------------------------------------------
class SinCurrent(model):
     def __init__(self, p, n):
         #Signal  declaration--------------------------------------------------
         self.I = signal('out',current,p,n)

         #Parameters declarations----------------------------------------------
         self.Fr=param(100.0,'Hz','Frequency of sine wave')
         self.Ia=param(1.0,'A','Amplitude of sine wave')
         self.Ph=param(0.0,'°','Phase of sine wave')
         self.Ioff=param(0.0,'A','Current offset')
  
     def analog(self):
          self.I+=self.Ia*sin(pi*2.0*self.Fr*time+self.Ph*pi/180.0)+self.Ioff