#-------------------------------------------------------------------------------
# Name:        OR
# Author:      Dhiabi Fathi
# Created:     14/03/2022
# Update:      04/10/2024
# Copyright:   (c) PyAMS
# Licence:     free
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage



# OR Gate Model-----------------------------------------------------------------
class OR(model):
     def __init__(self,O,I1,I2):
        #Signals declarations---------------------------------------------------
         self.In1 = signal('in',voltage,I1,'0')
         self.In2 = signal('in',voltage,I2,'0')
         self.Out = signal('out',voltage,O,'0')
        #Parameter declarations-------------------------------------------------
         self.IL=param(0.2,'V','In low voltage')
         self.IH=param(3.2,'V','In high voltage')
         self.OL=param(0.0,'V','Out low voltage')
         self.OH=param(5.0,'V','Out high voltage')

     def analog(self):
         if((self.In1<=self.IL) and (self.In2<=self.IL)):
            self.Out+=self.OL
         elif((self.In1>=self.IH) or (self.In2>=self.IH)):
            self.Out+=self.OH



