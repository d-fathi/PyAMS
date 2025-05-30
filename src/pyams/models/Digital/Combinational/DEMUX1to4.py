#-------------------------------------------------------------------------------
# Name:        1-to-4 Demultiplexer
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model

class DEMUX1to4(model):
    """ 1-to-4 Demultiplexer """
    def __init__(self, In, Sel0, Sel1, Out0, Out1, Out2, Out3):
        self.In = dsignal(direction='in', port=In)
        self.Sel0 = dsignal(direction='in', port=Sel0)
        self.Sel1 = dsignal(direction='in', port=Sel1)
        self.Out0 = dsignal(direction='out', port=Out0)
        self.Out1 = dsignal(direction='out', port=Out1)
        self.Out2 = dsignal(direction='out', port=Out2)
        self.Out3 = dsignal(direction='out', port=Out3)

    def digital(self):
        """ Perform DEMUX logic """
        s0 = self.Sel0
        s1 = self.Sel1
        self.Out0 += ~s1 & ~s0 & self.In
        self.Out1 += ~s1 & s0 & self.In
        self.Out2 += s1 & ~s0 & self.In
        self.Out3 += s1 & s0 & self.In
