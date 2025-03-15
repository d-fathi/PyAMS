#-------------------------------------------------------------------------------
# Name:        VCCS
# Author:      d.fathi
# Created:     10/03/2017
# Modified:    25/01/2020
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current

#Voltage-controlled current source Model----------------------------------------
class VCCS(model):
     def __init__(self,p1,n1,p2,n2):
        #Signals declarations---------------------------------------------------
         self.Vin = signal('in',voltage,p1,n1)
         self.Iout = signal('out',current,p2,n2)
        #Parameter declarations-------------------------------------------------
         self.G=param(1.0,' ','Gain multiplier')

     def analog(self):
         self.Iout+=self.G*self.Vin


