#-------------------------------------------------------------------------------
# Name:        Capacitor
# Author:        PyAMS
# Created:     25/06/2015
# Modified:    13/12/2023
# Copyright:   (c) PyAMS
# Licence:       free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current
from std import ddt

#Capacitor model----------------------------------------------------------------
class Capacitor(model):
     def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.V = signal('in',voltage,p,n)
         self.I = signal('out',current,p,n)
        #Parameter declarations-------------------------------------------------
         self.C=param(1.0e-6,'F','Capacitor value')

     def analog(self):
         #Ic=C*dVc/dt-----------------------------------------------------------
         self.I+=self.C*ddt(self.V)


