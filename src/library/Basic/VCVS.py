#-------------------------------------------------------------------------------
# Name:        VCVS
# Author:      d.fathi
# Created:     10/03/2017
# Modified:    25/01/2020
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from  electrical  import voltage


#Voltage-controlled voltage source Model----------------------------------------
class VCVS(model):
     def __init__(self,p1,n1,p2,n2):
        #Signals declarations---------------------------------------------------
         self.Vin = signal('in',voltage,p1,n1)
         self.Vout = signal('out',voltage,p2,n2)
        #Parameter declarations-------------------------------------------------
         self.G=param(1.0,' ','Gain multiplier')

     def analog(self):
         self.Vout+=self.G*self.Vin


