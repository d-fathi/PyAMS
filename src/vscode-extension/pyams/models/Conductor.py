#-------------------------------------------------------------------------------
# Name:        Conductor (wire / track with geometry, temperature and self-heating)
# Updated:     21/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------

from pyams.lib import model, signal, param
from pyams.lib import voltage, current
from pyams.lib import ddt

_counter = [0]          # every thermal conductor gets its own temperature node


# Conductor Model ------------------------------------------------------------------
class Conductor(model):
    """
    Conductor: a wire, a PCB track, a bus bar, a lamp filament.  Unlike a
    Resistor, the resistance comes from the material and the geometry and it
    follows the temperature:

        R0 = Rho * Len / Area                           (at the reference temperature T0)
        R  = R0 * (1 + Alpha (T - T0))                  (T = temperature of the conductor)
        I  = V / R

    Without self-heating (the default) T is the ambient temperature Tamb.

    Self-heating, ``Conductor(p, n, thermal=True)``: the conductor gets a
    thermal node whose voltage is the temperature rise DT (in kelvin) above the
    ambient, a thermal resistor Rth to the ambient (K/W) and a heat capacity Cth
    (J/K):

        Cth d(DT)/dt = P - DT / Rth,        P = V^2 / R,      T = Tamb + DT

    so the resistance changes with the dissipated power: a copper or tungsten
    wire (Alpha > 0) limits its own current as it heats up; with Alpha < 0 (a
    thermistor) it would run away.  The temperature rise can be plotted with
    ``setOutPuts("W1.DT")``.  The time constant is about Rth * Cth.

    Typical materials (Rho at 20 C in ohm m, Alpha in 1/K):
        copper 1.68e-8, 3.93e-3     silver 1.59e-8, 3.8e-3     gold 2.44e-8, 3.4e-3
        aluminium 2.65e-8, 3.9e-3   tungsten 5.6e-8, 4.5e-3    nichrome 1.1e-6, 4e-4
        constantan 4.9e-7, 1e-5

    Terminals: Conductor(p, n, thermal=False).

    Attributes:
        V (signal): voltage across the conductor.
        I (signal): current p -> n.
        DT (signal): temperature rise node (only with thermal=True).
        Rho (Ω m, 1.68e-8 copper), Len (m, 1), Area (m², 1e-6 = 1 mm²),
        Alpha (1/K, 3.93e-3), T0 (°C, 20), Tamb (°C, 25),
        Rth (K/W, 10) and Cth (J/K, 1): thermal parameters, used only with thermal=True.
    """
    def __init__(self, p, n, thermal=False):
        self._thermal = bool(thermal)
        self.V = signal('in', voltage, p, n)
        self.I = signal('out', current, p, n)
        if self._thermal:
            _counter[0] += 1
            nt = '_cond%d_dT' % _counter[0]
            self.DT = signal('in', voltage, nt, '0')         # temperature rise (K)
            self.Ith = signal('out', current, nt, '0')       # heat flow out of the node

        self.Rho = param(1.68e-8, 'Ω·m', 'Resistivity at T0')
        self.Len = param(1.0, 'm', 'Length')
        self.Area = param(1.0e-6, 'm²', 'Cross-section area')
        self.Alpha = param(3.93e-3, '1/K', 'Temperature coefficient of the resistivity')
        self.T0 = param(20.0, '°C', 'Reference temperature')
        self.Tamb = param(25.0, '°C', 'Ambient temperature')
        self.Rth = param(10.0, 'K/W', 'Thermal resistance to the ambient')
        self.Cth = param(1.0, 'J/K', 'Heat capacity')

    def resistance(self, temperature=None):
        """R at a temperature in °C (default: the ambient)."""
        t = self.Tamb if temperature is None else temperature
        return self.Rho * self.Len / self.Area * (1.0 + self.Alpha * (t - self.T0))

    def analog(self):
        r0 = self.Rho * self.Len / self.Area
        if self._thermal:
            dT = float(self.DT)
            r = r0 * (1.0 + self.Alpha * (self.Tamb + dT - self.T0))
            if r < 1.0e-3 * r0:                    # keep R positive for a very strong NTC
                r = 1.0e-3 * r0
            self.I += self.V / r
            power = self.V * self.V / r
            self.Ith += self.Cth * ddt(self.DT) + self.DT / self.Rth - power
        else:
            r = r0 * (1.0 + self.Alpha * (self.Tamb - self.T0))
            self.I += self.V / r
