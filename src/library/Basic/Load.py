#----------------------------------------------------
# Name:        Load
# Author:      d.fathi
# Created:     05/01/2015
# Modified:    09/10/2022
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#------------------------------------------------------

from PyAMS import signal,model,param
from  electrical import voltage,current

#Load-------------------------------------------------------------------
class Load(model):
    def __init__(self, p, n):
        #Signals declarations-------------------------------------------
        self.V=signal('out',voltage,p,n)
        self.I=signal('in',current,p,n)

        #Parameters declarations----------------------------------------
        self.R=param(100,'Ω','Resistive')
        #Local parameter for power calculation
        self.P=param(unit='W',description='Power')

    def analog(self):
        #Mathematical equation between I and V--------------------------
        self.V+=self.R*self.I
        #Power calculation----------------------------------------------
        self.P+=self.V*self.I