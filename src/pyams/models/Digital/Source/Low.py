#-------------------------------------------------------------------------------
# Name:        LOW (0) signal
# Author:      d.fathi
# Created:     27/04/2025
# Copyright:   (c) pyams 2025
# Licence:     free GPLv3
#-------------------------------------------------------------------------------

from pyams.lib import dsignal, model,circuit


class Low(model):
    """ Model for a constant LOW (0) signal """
    def __init__(self, Out):
        self.Out = dsignal(direction='out', port=Out, value='0')

    def digital(self):
        pass
