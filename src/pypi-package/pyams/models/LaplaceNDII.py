#-------------------------------------------------------------------------------
# Name:        Laplace block, current in -> current out
# Author:      d.fathi
# Created:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from .LaplaceND import LaplaceND
from .LaplaceZP import LaplaceZP
from ._laplace_ports import CurrentPorts


class LaplaceNDII(CurrentPorts, LaplaceND):
    """
    Laplace block, current in -> current out (numerator / denominator form).
    H(s) = Iout / Iin is a current gain (A/A).

    Same transfer function, coefficient order (highest power first), realisation,
    DC / AC / transient behaviour and limits as LaplaceND (voltage in -> voltage
    out); only the ports differ.

        H = LaplaceNDII(inp, inn, outp, outn, num=[...], den=[...])
        e.g. low-pass current mirror:  H = LaplaceNDII("a", "0", "0", "b", num=[2], den=[1e-4, 1])

    Current input : the port (inp, inn) is a short circuit that measures the
                    current flowing inp -> inn; drive it from a current source.
    Current output: like every PyAMS current source, the current flows from outp
                    to outn THROUGH the block; to push current into node X use
                    outp = "0", outn = X.
    Parameter: Gain (extra gain factor, default 1).
    """
    kind = 'ii'


class LaplaceZPII(CurrentPorts, LaplaceZP):
    """Zero-pole form of LaplaceNDII (see LaplaceZP and LaplaceNDII):
        H = LaplaceZPII(inp, inn, outp, outn, zeros=[...], poles=[...], gain=K)
    """
    kind = 'ii'
