#-------------------------------------------------------------------------------
# Name:        Switch control current
# Author:      d.fathi
# Created:     11/09/2024
# Modified:    11/09/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current
from Resistor import Resistor

#Switch control current Model--------------------------------------------------
class SwitchC(model):
    def __init__(self, pc,nc,p,n):
        #Signals declarations---------------------------------------------------
        self.Ic = signal('in',current,pc,nc)

        #Resistor model---------------------------------------------------------
        self.Rs=Resistor(p,n)

        #Parameters declarations------------------------------------------------
        self.Ion=param(1e-3,'A','Current for on switch')
        self.Ioff=param(-1e-3,'A','Current for off switch')
        self.Ron=param(10.0,'Ω','Resistance on value')
        self.Roff=param(1e+6,'Ω','Resistance on value')
        self.Rint=param(10.0,'Ω','Resistance intiale value')

    def sub(self):
        self.Rs.R=self.Rint
        return [self.Rs]


    def analog(self):
        #Switch on vlaue
        if(self.Ic>=self.Ion):
            self.Rs.R=self.Ron;

        #Switch off vlaue
        if(self.Ic<=self.Ioff):
            self.Rs.R=self.Roff;


