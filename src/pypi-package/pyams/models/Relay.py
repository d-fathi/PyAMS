#-------------------------------------------------------------------------------
# Name:        Relay (electromechanical relay, SPST / SPDT)
# Author:      d.fathi
# Created:     14/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from pyams.lib import model, signal, param, voltage, current, ddt


class Relay(model):
    """
    Electromechanical relay: a coil (resistance Rc in series with inductance Lc)
    that moves the contacts when enough current flows through it.

        coil :  V(cp, cn) = Rc * I + Lc * dI/dt

        com ---o   o--- no          normally open contact   (closed when energized)
                \\
                 o----- nc          normally closed contact (open when energized)

    Operation (with hysteresis and mechanical delay):
        the coil is "energized" when I rises above the pull-in current Ion and
        stays so until I falls below the drop-out current Ioff (Ioff < Ion);
        the contacts then move Ton seconds after the coil became energized and
        Toff seconds after it was released.  A change of the coil state that
        is reverted before the delay has elapsed is ignored (the armature does
        not move).  Contacts: resistance Ron when closed, Roff when open.

    Terminals: Relay(cp, cn, com, no, nc=None)
        cp, cn  coil terminals;  com  common contact;  no  normally open contact;
        nc      normally closed contact (optional: leave out for an SPST relay).
        The coil and the contacts are electrically isolated from each other.
    Parameters:
        Rc    coil resistance (ohm)                          70
        Lc    coil inductance (H)                            0.1
        Ion   pull-in current (A)                            0.05   (about 75 % of 5 V / Rc)
        Ioff  drop-out current (A)                           0.01
        Ton   operate time (s)                               5 ms
        Toff  release time (s)                               3 ms
        Ron   closed contact resistance (ohm)                0.05
        Roff  open contact resistance (ohm)                  1e9
    Signals / probes:  setOutPuts("K1.I") coil current,  "K1.pos" armature
    position (1 = energized position: no closed, nc open),  "K1.Ino", "K1.Inc"
    contact currents (com -> no, com -> nc).

    The coil current is an unknown of the circuit (like an inductor).  When a relay
    coil is switched by a transistor, add a freewheeling diode across the coil,
    as in a real circuit, because the inductive current cannot stop at once.
    """
    digital_state = ('pos', 'coil')

    def __init__(self, cp, cn, com, no, nc=None):
        self.V = signal('out', voltage, cp, cn)          # coil: V = Rc I + Lc dI/dt
        self.I = signal('in', current, cp, cn)
        self.Vno = signal('in', voltage, com, no)
        self.Ino = signal('out', current, com, no)
        self._has_nc = nc is not None
        if self._has_nc:
            self.Vnc = signal('in', voltage, com, nc)
            self.Inc = signal('out', current, com, nc)
        self.Rc = param(70.0, 'Ω', 'Coil resistance')
        self.Lc = param(0.1, 'H', 'Coil inductance')
        self.Ion = param(0.05, 'A', 'Pull-in current')
        self.Ioff = param(0.01, 'A', 'Drop-out current')
        self.Ton = param(5e-3, 's', 'Operate time')
        self.Toff = param(3e-3, 's', 'Release time')
        self.Ron = param(0.05, 'Ω', 'Closed contact resistance')
        self.Roff = param(1e9, 'Ω', 'Open contact resistance')
        self.pos = 0                                     # armature: 1 = energized position
        self.coil = 0                                    # coil state with hysteresis

    def digital_reset(self):
        self.pos = 0
        self.coil = 0

    def digital(self):
        i = float(self.I)
        if self.coil == 0 and i >= float(self.Ion):
            self.coil = 1
        elif self.coil == 1 and i <= float(self.Ioff):
            self.coil = 0
        self.after(float(self.Ton) if self.coil else float(self.Toff), 'pos', self.coil)

    def analog(self):
        self.V += self.Rc * self.I + self.Lc * ddt(self.I)
        g_on, g_off = 1.0 / float(self.Ron), 1.0 / float(self.Roff)
        closed = self.pos == 1
        self.Ino += (g_on if closed else g_off) * self.Vno
        if self._has_nc:
            self.Inc += (g_off if closed else g_on) * self.Vnc
