#-------------------------------------------------------------------------------
# Name:        InductorIc
# Author:      PyAMS
# Created:     25/06/2015
# Modified:    14/12/2023
# Copyright:   (c) PyAMS
# Licence:      free  "GPLv3"
#-------------------------------------------------------------------------------


from PyAMS import signal,model,param
from electrical import voltage,current
from std import ddt


#Inductor model-----------------------------------------------------------------
class InductorIc(model):
     def __init__(self, p, n):
         #Signals declarations--------------------------------------------------
         self.Vl = signal('out',voltage,p,n)
         self.Il = signal('in',current,p,n)
         #Parameter declarations------------------------------------------------
         self.L=param(1.0e-3,'H','Inductor value')
         self.Ic=param(0,'A','Initial charge')

     def analog(self):
         #Vl=L*dIL/dt-----------------------------------------------------------
         self.Vl+=self.L*ddt(self.Il,self.Ic)
