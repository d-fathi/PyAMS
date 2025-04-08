#-------------------------------------------------------------------------------
# Name:        Sine wave Current
# Author:      D.Fathi
# Created:     20/03/2015
# Modified:    05/04/2020
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#-------------------------------------------------------------------------------

from PyAMS import signal, param, model
from standardFunction import realTime
from electrical import current
from math  import sin, pi

#Sine wave Current  source------------------------------------------------------
class SinCurrent(model):
     def __init__(self, p, n):
         #Signals declarations--------------------------------------------------
         self.I = signal('out',current,p,n)

         #Parameters declarations-----------------------------------------------
         self.Fr=param(100.0,'Hz','Frequency of sine wave')
         self.Ia=param(1.0,'A','Amplitude of sine wave')
         self.Ph=param(0.0,'Deg','Phase of sine wave')
         self.Ioff=param(0.0,'A','Current offset')
     def period(self):
          #Get period by cycle and phase-------------------------------------------
          return [(1.0/self.Fr,self.Ph*pi/180.0)]
     def analog(self):
          self.I+=self.Ia*sin(pi*2.0*self.Fr*realTime()+self.Ph*pi/180.0)+self.Ioff
