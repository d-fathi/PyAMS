#-------------------------------------------------------------------------------
# Name:        1-to-2 Demultiplexer
# Author:      d.fathi
# Created:     20/05/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
#-------------------------------------------------------------------------------


from pyams.lib import dsignal, model

class DEMUX1to2(model):
    """ 1-to-2 Demultiplexer """
    def __init__(self, In, Sel, Out0, Out1):
        self.In = dsignal(direction='in', port=In)
        self.Sel = dsignal(direction='in', port=Sel)
        self.Out0 = dsignal(direction='out', port=Out0)
        self.Out1 = dsignal(direction='out', port=Out1)

    def digital(self):
        """ Perform DEMUX logic """
        self.Out0 += ~self.Sel & self.In
        self.Out1 += self.Sel & self.In