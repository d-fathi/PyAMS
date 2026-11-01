#-------------------------------------------------------------------------------
# Name:        Piece-wise linear current source (SPICE PWL)
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import signal, param, model, time
from pyams.lib import current
from .PWLVoltage import parse_points, pwl_eval


class PWLCurrent(model):
    """
    Piece-wise linear current source (SPICE ``PWL``); same behaviour as
    PWLVoltage. The current flows from p to n through the source.

        I(t) = Scale * pwl(t - Td) + Ioff

    Terminals: PWLCurrent(p, n)
        I1 = PWLCurrent("0", "a", points="0 0, 1m 2m, 2m 2m, 3m 0")   # A, SI prefixes allowed
    Parameters: Td (s), Scale, Ioff (A), Rep (1 = repeat).
    """
    def __init__(self, p, n, points=None):
        self.I = signal('out', current, p, n)
        self.Td = param(0.0, 's', 'Delay')
        self.Scale = param(1.0, ' ', 'Amplitude scale')
        self.Ioff = param(0.0, 'A', 'Offset')
        self.Rep = param(0.0, ' ', 'Repeat (1) or single shot (0)')
        self.setPoints(points if points is not None
                       else [(0.0, 0.0), (1e-3, 1e-3), (2e-3, 1e-3), (3e-3, 0.0)])

    def setPoints(self, points):
        self._ts, self._vs = parse_points(points, 'A')

    def analog(self):
        y = pwl_eval(float(time), self._ts, self._vs, float(self.Td), float(self.Rep) > 0.5)
        self.I += float(self.Scale) * y + float(self.Ioff)
