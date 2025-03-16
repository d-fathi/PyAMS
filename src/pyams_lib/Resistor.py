#-------------------------------------------------------------------------------
# Name:        Resistor
# Author:      d.fathi
# Created:     20/03/2015
# Modified:    01/04/2020
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from PyAMS import model,signal,param
from electrical import voltage,current

#Resistor Model-----------------------------------------------------------------
class Resistor(model):
    def __init__(self, p, n):
        #Signals declarations---------------------------------------------------
        self.V = signal('in',voltage,p,n)
        self.I = signal('out',current,p,n)

        #Parameters declarations------------------------------------------------
        self.R=param(1000.0,'Ω','Resistance')
        self.Pout=param(1000.0,'Ω','Resistance')

    def analog(self):
        #Resistor equation-low hom (Ir=Vr/R)------------------------------------
        self.I+=self.V/self.R
        self.Pout+=self.V*self.I
