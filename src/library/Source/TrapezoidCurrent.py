#-------------------------------------------------------------------------------
# Name:        Trapezoid current Source
# Author:      D.Fathi
# Created:     14/03/2017
# Modified:    12/09/2024
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from PyAMS import model,time,signal,param
from electrical import current



#Source for Trapezoid current---------------------------------------------------
class TrapezoidCurrent(model):
     def __init__(self, a, b):
         #Signal  declaration---------------------------------------------------
         self.I = signal('out',current,a,b)

         #Parameters declarations-----------------------------------------------
         self.I0=param(1.0,'A','Initial current ')
         self.I1=param(1.0,'A','Peak current ')
         self.Td=param(0,'Sec','Initial delay time')
         self.Tr=param(0,'Sec','Rise time')
         self.Tw=param(0.05,'Sec','Pulse-width')
         self.Tf=param(0,'Sec','Fall time')
         self.T=param(0.1,'Sec','Period of wave')
         self.Ioff=param(0.0,'A','Offset current')

     def analog(self):
         n=(time-self.Td)-int((time-self.Td)/self.T)*self.T
         if(time<=self.Td):
            self.I+=self.I0+self.Ioff
         elif(n<=self.Tr):
            a=(self.I1-self.I0)/self.Tr
            self.I+=a*n+self.I0+self.Ioff 
         elif(n<=(self.Tr+self.Tw)):
            self.I+=self.I1+self.Ioff
         elif(n<=(self.Tr+self.Tw+self.Tf)):
            a=(self.I0-self.I1)/self.Tf
            self.I+=a*(n-self.Tr-self.Tw)+self.I1+self.Ioff
         else:
            self.I+=self.I0


