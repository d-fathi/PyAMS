#-------------------------------------------------------------------------------
# Name:        HIGH (1) signal
# Author:      d.fathi
# Created:     02/05/2025
# Copyright:   (c) pyams 2025
# Licence:     free GPLv3
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model,circuit


class High(model):
    """ Model for a constant HIGH (1) signal """
    def __init__(self, Out):
        self.Out = dsignal(direction='out', port=Out, value='1')

    def digital(self):
        pass
