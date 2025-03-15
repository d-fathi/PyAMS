#-------------------------------------------------------------------------------
# Name:        Simple P-channel MOSFET (Level 1)
# Author:      D.Fathi
# Created:     10/05/2015
# Modified:    14/03/2025
# Copyright:   (c) PyAMS 2024
# Licence:     CC-BY-SA
#-------------------------------------------------------------------------------

from PyAMS import signal, model, param
from electrical import voltage, current

# Simple P-channel MOSFET model
class PMOS(model):
    def __init__(self, d, g, s):
        # Signals
        self.Vgs = signal('in', voltage, s, g)  # Corrected for P-channel
        self.Vds = signal('in', voltage, s, d)  # Corrected for P-channel
        self.Id = signal('out', current, s, d)
        self.Ig = signal('out', current, g, '0')

        # Parameters
        self.Kp = param(200e-6, 'A/V^2', 'Transconductance coefficient')
        self.W = param(10e-6, 'm', 'Channel width')
        self.L = param(1e-6, 'm', 'Channel length')
        self.Vt = param(-0.7, 'V', 'Threshold voltage')  # P-channel Vt should be negative
        self.lambd = param(0.02, '1/V', 'Channel-length modulation')

    def analog(self):
        K = self.Kp * self.W / self.L
        
        # Cutoff Region: Vgs ≥ Vt
        if self.Vgs >= self.Vt:
            self.Id += 0.0
        
        # Triode Region: Vgs < Vt and Vds ≥ Vgs - Vt
        elif self.Vds >= (self.Vgs - self.Vt):
            self.Id += K * ((self.Vgs - self.Vt) * self.Vds - (self.Vds**2) / 2) * (1 + self.lambd * self.Vds)
        
        # Saturation Region: Vgs < Vt and Vds < Vgs - Vt
        else:
            self.Id += (K / 2) * (self.Vgs - self.Vt)**2 * (1 + self.lambd * self.Vds)
