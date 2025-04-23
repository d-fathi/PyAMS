#-------------------------------------------------------------------------------
# Name:        Standard Function
# Author:      Dhiabi Fathi
# Created:     19/03/2015
# Update:      18/10/2025
# Copyright:   (c) PyAMS 2025
# Web:         https://pyams.sf.net/
# Info:        standard Function
#-------------------------------------------------------------------------------
from math import exp

def  explim(a):
     if a>=200.0:
          return (a-199.0)*exp(200.0)
     return exp(a)





