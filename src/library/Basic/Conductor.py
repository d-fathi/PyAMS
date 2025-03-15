#-------------------------------------------------------------------------------
# Name:        Conductor
# Author:      d.fathi
# Created:     06/03/2017
# Modified:    24/01/2020
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#--------------------------------------------------------------------------------


from PyAMS import model,signal,param
from  electrical  import voltage,current

#Ideal linear electrical conductor
class Conductor(model):
     def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
         self.Vg = signal('in',voltage,p,n)
         self.Ig = signal('out',current,p,n)

        #Parameter declarations-------------------------------------------------
         self.G=param(1.0,'1/Ω','Conductance  value')

     def analog(self):
         self.Ig+=self.Vg*self.G
