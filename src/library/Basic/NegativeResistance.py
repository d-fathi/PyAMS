#-------------------------------------------------------------------------------
# Name:        Negative resistance
# Author:      Dhiabi Fathi
# Created:     28/07/2020
# Modified:    28/07/2020
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#--------------------------------------------------------------------------------


from PyAMS import model,signal,param
from electrical import voltage,current

#Negative Resistance
class NegativeResistance(model):
     def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.Vn = signal('in',voltage,p,n)
         self.In = signal('out',current,p,n)

        #Parameter declarations-------------------------------------------------
         self.Gb=param(-1.0,'1/Ω','Conductance  multiplier')
         self.Ga=param(-1.0,'1/Ω','Conductance  multiplier')
         self.Ve=param(1.0,'V','Voltage')

     def analog(self):

         if (self.Vn <-self.Ve):
            self.In+=self.Gb*(self.Vn+self.Ve)-self.Ga*self.Ve
         elif  (self.Vn >self.Ve):
            self.In+=self.Gb*(self.Vn-self.Ve)+self.Ga*self.Ve
         else:
            self.In+=self.Ga*self.Vn

