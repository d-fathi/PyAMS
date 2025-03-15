#-------------------------------------------------------------------------------
# Name:        Vdc Source
# Author:      D.fathi
# Created:     20/03/2015
# Modified:    01/04/2020
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#-------------------------------------------------------------------------------


from PyAMS import signal,param,model
from electrical import voltage


#Source for constant voltage

class DCVoltage(model):
     def __init__(self, p, n):
         #Signals declarations--------------------------------------------------
         self.V=signal('out',voltage,p,n)

         #Parameters declarations-----------------------------------------------
         self.Vdc=param(15.0,'V','Value of constant voltage')

     def analog(self):
         self.V+=self.Vdc


