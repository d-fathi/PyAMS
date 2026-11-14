#-------------------------------------------------------------------------------
# Name:        Ports of the current-mode Laplace blocks (shared by LaplaceNDII / IV / VI)
# Author:      d.fathi
# Created:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from pyams.lib import signal
from pyams.lib import voltage, current


class CurrentPorts:
    """Mixin that sets the input / output kind of a LaplaceND block.

    Class attribute ``kind`` = "ii", "iv" or "vi" (input kind, output kind):
      input  "i": the port (inp, inn) is a 0 V ammeter; the current that flows
                  inp -> inn through it is the input signal
      input  "v": the voltage v(inp) - v(inn) is the input signal
      output "i": a current source, current flows outp -> outn through the block
      output "v": an ideal voltage source v(outp) - v(outn)
    """
    kind = 'ii'

    def _ports(self, inp, inn, outp, outn):
        if self.kind[0] == 'i':
            self.Vin = signal('out', voltage, inp, inn)      # stays 0 V
            self.Iin = signal('in', current, inp, inn)
        else:
            self.Vin = signal('in', voltage, inp, inn)
        if self.kind[1] == 'i':
            self.Iout = signal('out', current, outp, outn)
        else:
            self.Vout = signal('out', voltage, outp, outn)

    def _read_in(self):
        return float(self.Iin) if self.kind[0] == 'i' else float(self.Vin)

    def _write_out(self, y):
        if self.kind[1] == 'i':
            self.Iout += y
        else:
            self.Vout += y
