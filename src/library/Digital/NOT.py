#-------------------------------------------------------------------------------
# Name:        NOT Gate
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      04/10/2024
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage


# NOT Gate Model---------------------------------------------------------------
class NOT(model):
     def __init__(self,Out,In):
        #Signals declarations---------------------------------------------------
         self.Vin = signal('in',voltage,In)
         self.Vout = signal('out',voltage,Out)

        #Parameter declarations-------------------------------------------------
         self.IL=param(0.2,'V','In low voltage')
         self.IH=param(3.2,'V','In high voltage')
         self.OL=param(0.0,'V','Out low voltage')
         self.OH=param(5.0,'V','Out high voltage')

     def analog(self):
         if(self.Vin<=self.IL):
            self.Vout+=self.OH
         elif(self.Vin>=self.IH):
            self.Vout+=self.OL




