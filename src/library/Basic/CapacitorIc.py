#-------------------------------------------------------------------------------
# Name:        Capacitor with initial charge
# Author:        PyAMS
# Created:     16/01/2024
# Modified:    16/01/2024
# Copyright:   (c) PyAMS
# Licence:       free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current
from std import ddt


#Capacitor with initial charge (Ic) model----------------------------------------------------------------
class CapacitorIc(model):
     def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.V = signal('in',voltage,p,n)
         self.I = signal('out',current,p,n)
        #Parameter declarations-------------------------------------------------
         self.C=param(1.0e-6,'F','Capacitor value')
         self.Ic=param(0,'V','Initial charge')

     def analog(self):
         #Ic=C*dVc/dt-----------------------------------------------------------
         self.I+=self.C*ddt(self.V,self.Ic)


