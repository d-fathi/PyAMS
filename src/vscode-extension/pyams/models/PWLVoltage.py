#-------------------------------------------------------------------------------
# Name:        Piece-wise linear voltage source (SPICE PWL)
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from bisect import bisect_right
from pyams.lib import signal, param, model, time
from pyams.lib import voltage
from pyams.lib import _parse_value


def parse_points(points, vunit='V'):
    """Return (times, values) from a list of (t, v) pairs, a flat list
    [t0, v0, t1, v1, ...] or a string such as "0 0, 1m 5, 2m 5, 3m 0"
    (SI prefixes allowed)."""
    if isinstance(points, str):
        items = points.replace(',', ' ').replace(';', ' ').replace('(', ' ').replace(')', ' ').split()
        flat = [_parse_value(x, u) for x, u in zip(items, ['s', vunit] * len(items))]
    else:
        flat = []
        for p in points:
            if isinstance(p, (tuple, list)):
                flat.extend(p)
            else:
                flat.append(p)
        flat = [float(x) for x in flat]
    if len(flat) < 4 or len(flat) % 2:
        raise ValueError('PWL needs at least two (time, value) pairs')
    ts, vs = flat[0::2], flat[1::2]
    if any(b < a for a, b in zip(ts, ts[1:])):
        raise ValueError('PWL times must not decrease')
    return ts, vs


def pwl_value(t, ts, vs):
    """Linear interpolation; constant before the first and after the last point.
    Two points with the same time make a vertical step."""
    if t <= ts[0]:
        return vs[0]
    if t >= ts[-1]:
        return vs[-1]
    k = bisect_right(ts, t) - 1          # ts[k] <= t < ts[k+1]
    t0, t1 = ts[k], ts[k + 1]
    return vs[k] + (vs[k + 1] - vs[k]) * (t - t0) / (t1 - t0)


def pwl_eval(t, ts, vs, delay, repeat):
    t = t - delay
    if repeat and t > ts[0] and ts[-1] > ts[0]:
        t = ts[0] + (t - ts[0]) % (ts[-1] - ts[0])
    return pwl_value(t, ts, vs)


class PWLVoltage(model):
    """
    Piece-wise linear voltage source (SPICE ``PWL``): the voltage is defined by
    a list of (time, value) points and linearly interpolated between them.

        V(t) = Scale * pwl(t - Td) + Voff

    Before the first point it holds the first value, after the last point it
    holds the last value. Two points with the same time make a vertical step.
    With Rep = 1 the waveform between the first and last points repeats.

    Terminals: PWLVoltage(p, n)   (V(p) - V(n) = V)
    Points can be given in the constructor or later:
        V1 = PWLVoltage("a", "0", points=[(0, 0), (1e-3, 5), (2e-3, 5), (3e-3, 0)])
        V1.setPoints("0 0, 1m 5, 2m 5, 3m 0")        # SI prefixes allowed
    Parameters:
        Td    delay (s)             (0)
        Scale amplitude factor      (1)
        Voff  offset (V)            (0)
        Rep   1 = repeat, 0 = once  (0)
    The DC (operating point) value is the waveform value at t = 0.
    """
    def __init__(self, p, n, points=None):
        self.V = signal('out', voltage, p, n)
        self.Td = param(0.0, 's', 'Delay')
        self.Scale = param(1.0, ' ', 'Amplitude scale')
        self.Voff = param(0.0, 'V', 'Offset')
        self.Rep = param(0.0, ' ', 'Repeat (1) or single shot (0)')
        self.setPoints(points if points is not None
                       else [(0.0, 0.0), (1e-3, 5.0), (2e-3, 5.0), (3e-3, 0.0)])

    def setPoints(self, points):
        self._ts, self._vs = parse_points(points, 'V')

    def analog(self):
        y = pwl_eval(float(time), self._ts, self._vs, float(self.Td), float(self.Rep) > 0.5)
        self.V += float(self.Scale) * y + float(self.Voff)
