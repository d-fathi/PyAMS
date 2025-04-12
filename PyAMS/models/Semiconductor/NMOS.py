#-------------------------------------------------------------------------------
# Name:        Simple N-channel MOSFET (Level 1)
# Author:      D.Fathi
# Created:     10/05/2015
# Modified:    28/03/2025
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------

from pyams_lib import signal, model, param
from pyams_lib import voltage, current

# Simple N-channel MOSFET model--------------------------------------------------
class NMOS(model):
    """
    This class implements a simple N-channel MOSFET model.

    Attributes:
        Vgs (signal): Gate-Source voltage.
        Vds (signal): Drain-Source voltage.
        Id (signal): Drain current.
        Ig (signal): Gate current (assumed to be zero for ideal MOSFET).
        Kp (param): Transconductance coefficient.
        W (param): Channel width.
        L (param): Channel length.
        Vt (param): Threshold voltage.
        lambd (param): Channel-length modulation parameter.

    Methods:
        analog(): Defines the MOSFET's behavior in cutoff, triode, and saturation regions.
    """
    def __init__(self, d, g, s):
        # Signals-------------------------------------------------------------
        self.Vgs = signal('in', voltage, g, s)
        self.Vds = signal('in', voltage, d, s)
        self.Id = signal('out', current, d, s)
        self.Ig = signal('out', current, g, '0')

        # Parameters----------------------------------------------------------
        self.Kp = param(200e-6, 'A/V^2', 'Transconductance coefficient')
        self.W = param(100.0e-6, 'm', 'Channel width')
        self.L = param(100.0e-6, 'm', 'Channel length')
        self.Vt = param(0.5, 'V', 'Threshold voltage')
        self.lambd = param(0.000, '1/V', 'Channel-length modulation')

    def analog(self):
        """Defines the MOSFET's behavior in different operating regions."""
        K = self.Kp * self.W / self.L
        self.Ig += 0.0

        # Cutoff Region: Vgs <= Vt
        if self.Vgs <= self.Vt:
            self.Id += 0.0
        # Saturation Region:  Vgs - Vt < Vds
        elif (self.Vgs - self.Vt) < self.Vds:
            self.Id += K * (self.Vgs - self.Vt) ** 2 * (1 + (self.lambd * self.Vds)) / 2
        # Triode Region:  Vgs - Vt >= Vds
        else:
            self.Id += K * ((self.Vgs - self.Vt) - (self.Vds / 2)) * (1 + (self.lambd * self.Vds)) * self.Vds
