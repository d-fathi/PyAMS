#-------------------------------------------------------------------------------
# Name:        Laplace block, current in -> voltage out
# Author:      d.fathi
# Created:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from .LaplaceND import LaplaceND
from .LaplaceZP import LaplaceZP
from ._laplace_ports import CurrentPorts


class LaplaceNDIV(CurrentPorts, LaplaceND):
    """
    Laplace block, current in -> voltage out (numerator / denominator form).
    H(s) = Vout / Iin is a transimpedance (ohm).

    Same transfer function, coefficient order (highest power first), realisation,
    DC / AC / transient behaviour and limits as LaplaceND (voltage in -> voltage
    out); only the ports differ.

        H = LaplaceNDIV(inp, inn, outp, outn, num=[...], den=[...])
        e.g. ideal capacitor 1/(C s):  Z = LaplaceNDIV("a", "0", "va", "0", num=[1], den=[C, 0])

    Current input : the port (inp, inn) is a short circuit that measures the
                    current flowing inp -> inn; drive it from a current source.
    Current output: like every PyAMS current source, the current flows from outp
                    to outn THROUGH the block; to push current into node X use
                    outp = "0", outn = X.
    Parameter: Gain (extra gain factor, default 1).
    """
    kind = 'iv'


class LaplaceZPIV(CurrentPorts, LaplaceZP):
    """Zero-pole form of LaplaceNDIV (see LaplaceZP and LaplaceNDIV):
        H = LaplaceZPIV(inp, inn, outp, outn, zeros=[...], poles=[...], gain=K)
    """
    kind = 'iv'
