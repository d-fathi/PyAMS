#-------------------------------------------------------------------------------
# Name:        Simple BJT (NPN)
# Author:      d.Fathi
# Created:     01/05/2015
# Modified:    18/03/2023
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------


from PyAMS import signal,model,param
from electrical import voltage,current
from std import explim



#Simple BJT (NPN)---------------------------------------------------------------

class NPN(model):
      def __init__(self,c,b,e):
           #Signals-------------------------------------------------------------
           self.Vbe=signal('in',voltage,b,e)
           self.Vbc=signal('in',voltage,b,c)
           self.Vce=signal('in',voltage,c,e)
           self.Ic=signal('out',current,c)
           self.Ib=signal('out',current,b)
           self.Ie=signal('out',current,e)

           #paramaters----------------------------------------------------------
           self.Nf=param(1.0,' ','Forward current emission coefficient')
           self.Nr=param(1.0,' ','current emission coefficient')
           self.Is=param(1.0e-16,'A','Transport saturation current')
           self.area=param(1.0,' ','Area')
           self.Br=param(1.0,' ','Ideal maximum reverse beta')
           self.Bf=param(100.0,' ','Ideal maximum forward beta')
           self.Vt=param(0.025,'V','Voltage equivalent of temperature')
           self.Var=param(1e+3,'V','Reverse Early voltage');
           self.Vaf=param(1e+3,'V','Forward Early voltage');
           self.gmin=param(1e-12,'1/Ohm','Inductance')

      def analog(self):

            Vt=self.Vt
            Icc=self.Is*(explim(self.Vbe/(self.Nf*Vt))-1)
            Ice=self.Is*(explim(self.Vbc/(self.Nr*Vt))-1)
            Ict=(Icc-Ice)*(1-self.Vbc/self.Vaf-self.Vbe/self.Var)
            self.Ic+=Ict-Ice/self.Br+self.gmin*self.Vbc
            self.Ib+=Ice/self.Br+Icc/self.Bf
            self.Ie+=-Ict-Icc/self.Bf+self.gmin*self.Vbe





