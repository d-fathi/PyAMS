#-------------------------------------------------------------------------------
# Name:        Source Idc
# Author:      D.fathi
# Created:     20/03/2015
# Modified:    05/01/2020
# Copyright:   (c) PyAMS
# Licence:     CC-BY-SA
#-------------------------------------------------------------------------------

from PyAMS import signal,param,model
from electrical import current

#Source for constant current
class DCCurrent(model):
     def __init__(self, p, n):
         #Signal declarations---------------------------------------------------
         self.I = signal('out',current,p,n)

         #Parameters declarations-----------------------------------------------
         self.Idc=param(0.001,'A','Value of constant current')
     def analog(self):
         self.I+=self.Idc

