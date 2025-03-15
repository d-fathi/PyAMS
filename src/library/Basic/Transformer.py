#-------------------------------------------------------------------------------
# Name:        Transformer with two ports
# Author:      Dhiabi Fathi
# Created:     06/03/2017
# Modified:    24/04/2021
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current
from std import ddt

#Behavioral modeling of Mutual Inductor-----------------------------------------
class Transformer(model):
     def __init__(self, p1, n1,p2, n2):
         #Declaration of the signals--------------------------------------------
         self.Vp = signal('out',voltage,p1, n1)
         self.Ip = signal('in',current,p1, n1)
         self.Vs = signal('out',voltage,p2, n2)
         self.Is = signal('in',current,p2, n2)

        #Parameter declarations-------------------------------------------------
         self.Lp=param(1.0,'H','Primary inductance Value')
         self.Ls=param(1.0,'H','Secondary inductance Value')
         self.M=param(0.5,'H','Coupling inductance Value')


     def analog(self):
         #the equation of Mutual Inductor---------------------------------------
         self.Vp+=self.Lp*ddt(self.Ip)+self.M*ddt(self.Is)
         self.Vs+=self.Ls*ddt(self.Is)+self.M*ddt(self.Ip)

