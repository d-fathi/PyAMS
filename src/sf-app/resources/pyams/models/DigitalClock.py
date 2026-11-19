#-------------------------------------------------------------------------------
# Name:        Digital clock (square wave)
# Author:      d.fathi
# Created:     02/05/2025
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------

from pyams.lib import model, param, dsignal


class DigitalClock(model):
    """
    Square-wave clock: low until Td, then high for Duty / Freq, low for the
    rest of the period, and so on.  The edges are scheduled events, so the
    simulator lands on them exactly whatever the time step.

    Terminals: DigitalClock(out)
    Parameters: Freq (Hz, 1 MHz), Duty (0..1, 0.5), Td (s, 0) and the logic
    family of dsignal (Voh, Vol, Rout, Cout).
    """
    def __init__(self, out):
        self.Out = dsignal('out', out)
        self.Freq = param(1.0e6, 'Hz', 'Frequency')
        self.Duty = param(0.5, ' ', 'Duty cycle (fraction of the period at 1)')
        self.Td = param(0.0, 's', 'Delay of the first rising edge')
        self._k = 0
        self._armed = False

    def digital_reset(self):
        self._k = 0
        self._armed = False

    def _edge_time(self, k):
        T = 1.0 / float(self.Freq)
        return float(self.Td) + (k // 2) * T + (k % 2) * float(self.Duty) * T

    def _toggle(self, t):
        self.Out.value = 1 - int(self.Out)
        self._k += 1
        self.at(self._edge_time(self._k), self._toggle)

    def digital(self):
        if not self._armed:
            self._armed = True
            self.at(self._edge_time(0), self._toggle)
