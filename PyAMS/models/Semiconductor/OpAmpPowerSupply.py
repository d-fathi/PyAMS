#-------------------------------------------------------------------------------
# Name:       OpAmp Power Supply
# Author:      D.Fathi
# Created:     10/05/2015
# Modified:    28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal, model, param
from pyams_lib import voltage, current
from math import atan,pi

class OpAmpPowerSupply(model):
   def __init__(self,p,n,sp,sn,o):
      #Signals declarations------------------------------------------------
      self.Vin = signal('in',voltage,p,n)
      self.Vout = signal('out',voltage,o)
      self.Vsp = signal('in',voltage,sp)
      self.Vsn = signal('in',voltage,sn)

      #Pramatre declarations------------------------------------------------
      self.G =param(1000,' ','Gain amplifier')

   def analog(self):

      if  self.Vin >0:
         self.Vout+=self.Vsp*2*atan(self.G*self.Vin*pi/((1+self.Vsp)*2))/pi
      else:
         self.Vout+=-self.Vsn*2*atan(self.G*self.Vin*pi/((1-self.Vsn)*2))/pi



