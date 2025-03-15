#-------------------------------------------------------------------------------
# Name:        Trapezoid voltage Source
# Author:      D.Fathi
# Created:     14/03/2017
# Modified:    12/09/2024
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param,time
from electrical import voltage


#Source for Trapezoid voltage---------------------------------------------------
class TrapezoidVoltage(model):
     def __init__(self, a, b):
         #Signal  declaration---------------------------------------------------
         self.V = signal('out',voltage,a,b)

         #Parameters declarations-----------------------------------------------
         self.V0=param(1.0,'V','Initial voltage ')
         self.V1=param(1.0,'V','Peak voltage ')
         self.Td=param(0,'Sec','Initial delay time')
         self.Tr=param(0,'Sec','Rise time')
         self.Tw=param(0.05,'Sec','Pulse-width')
         self.Tf=param(0,'Sec','Fall time')
         self.T=param(0.1,'Sec','Period of wave')
         self.Voff=param(0.0,'V','Offset voltage')

     def analog(self):
         n=(time-self.Td)-int((time-self.Td)/self.T)*self.T
         if(time<=self.Td):
            self.V+=self.V0+self.Voff
         elif(n<=self.Tr):
            a=(self.V1-self.V0)/self.Tr
            self.V+=a*n+self.V0+self.Voff 
         elif(n<=(self.Tr+self.Tw)):
            self.V+=self.V1+self.Voff
         elif(n<=(self.Tr+self.Tw+self.Tf)):
            a=(self.V0-self.V1)/self.Tf
            self.V+=a*(n-self.Tr-self.Tw)+self.V1+self.Voff
         else:
            self.V+=self.V0

