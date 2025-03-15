#-------------------------------------------------------------------------------
# Name:        Bridge of diode
# Author:      d.fathi
# Created:     03/04/2017
# Modified:    22/12/2021
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------



from PyAMS import param,model
from Diode import *


#Bideg of  diode----------------------------------------------------------------
class DiodeBridge(model):
     def __init__(self,a,b,c,d):
         # Paramaters-----------------------------------------------------------
          self.Iss=param(1.0e-12,'A','Saturation current');
          self.Vt=param(0.025,'V','Voltage equivalent of temperature (kT/qn)')

         # Elements-------------------------------------------------------------
          self.D1=Diode(a,b)
          self.D2=Diode(c,b)
          self.D3=Diode(d,c)
          self.D4=Diode(d,a)

     def  sub(self):
           self.D1.Iss+=self.Iss
           self.D2.Iss+=self.Iss
           self.D3.Iss+=self.Iss
           self.D4.Iss+=self.Iss
           self.D1.Vt+=self.Vt
           self.D2.Vt+=self.Vt
           self.D3.Vt+=self.Vt
           self.D4.Vt+=self.Vt
           return [self.D1,self.D2,self.D3,self.D4]


     def analog(self):
           pass
