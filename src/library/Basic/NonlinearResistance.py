#-------------------------------------------------------------------------------
# Name:        Non linear resistance
# Author:      PyAMS
# Created:     20/08/2020
# Modified:    25/01/2024
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#--------------------------------------------------------------------------------


from PyAMS import model,signal,param
from electrical import voltage,current

#Non linear Resistance
class NonlinearResistance(model):
     def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.Vr = signal('in',voltage,p,n)
         self.Ir = signal('out',current,p,n)

        #Parameter declarations-------------------------------------------------
         self.µ=param(1.0,' ','Scalar of nonlinearity')

  
     def analog(self):
         self.Ir += self.µ*self.Vr*(self.Vr*self.Vr-1)


