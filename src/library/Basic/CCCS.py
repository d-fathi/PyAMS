#-------------------------------------------------------------------------------
# Name:        CCCS
# Author:      d.fathi
# Created:     10/03/2017
# Modified:    24/01/2020
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from  electrical  import current

#Current-controlled current source Model----------------------------------------
class CCCS(model):
     def __init__(self,p1,n1,p2,n2):
        #Signals declarations---------------------------------------------------
         self.Iin=signal('in',current,p1,n1)
         self.Iout=signal('out',current,p2,n2)
        #Parameter declarations-------------------------------------------------
         self.G=param(1.0,' ','Gain multiplier')

     def analog(self):
         self.Iout+=self.G*self.Iin


