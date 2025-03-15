#-------------------------------------------------------------------------------
# Name:        Switch
# Author:      d.fathi
# Created:     10/09/2024
# Modified:    10/09/2024
# Copyright:   (c) PyAMS 2024
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current
from Resistor import Resistor

#Switch control voltage Model--------------------------------------------------
class Switch(model):
    def __init__(self, pc,nc,p,n):
        #Signals declarations---------------------------------------------------
        self.Vc = signal('in',voltage,pc,nc)

        #Resistor model---------------------------------------------------------
        self.Rs=Resistor(p,n)

        #Parameters declarations------------------------------------------------
        self.Von=param(5.0,'V','Voltage for on switch')
        self.Voff=param(-5.0,'V','Voltage for off switch')
        self.Ron=param(10.0,'Ω','Resistance on value')
        self.Roff=param(1e+6,'Ω','Resistance on value')
        self.Rint=param(10.0,'Ω','Resistance intiale value')

    def sub(self):
        self.Rs.R=self.Rint
        return [self.Rs]


    def analog(self):
        #Switch on vlaue
        if(self.Vc>=self.Von):
            self.Rs.R=self.Ron;

        #Switch off vlaue
        if(self.Vc<=self.Voff):
            self.Rs.R=self.Roff;





