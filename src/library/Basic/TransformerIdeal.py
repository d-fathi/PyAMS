#-------------------------------------------------------------------------------
# Name:        Transformer with two ports
# Author:      Dhiabi Fathi
# Created:     20/04/2022
# Modified:    20/04/2022
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#https://electronics.stackexchange.com/questions/418003/ideal-dc-transformer-in-ltspice
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current


#Behavioral modeling of transformer---------------------------------------------
class TransformerIdeal(model):
     def __init__(self, p1, n1,p2, n2):

         #Declaration of the signals--------------------------------------------
         self.Vp = signal('in',voltage,p1, n1)
         self.Ip = signal('out',current,p1, n1)
         self.Vs = signal('out',voltage,p2, n2)
         self.Is = signal('in',current,p2, n2)



        #Parameter declarations-------------------------------------------------
         self.N=param(7.0,' ','Winding ratio')



     def analog(self):
         #the equation of ideal transformer-------------------------------------
         self.Vs+=self.Vp/self.N
         self.Ip+=self.Is/self.N

