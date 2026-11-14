#-------------------------------------------------------------------------------
# Name:        Laplace block, voltage in -> current out
# Author:      d.fathi
# Created:     11/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
from .LaplaceND import LaplaceND
from .LaplaceZP import LaplaceZP
from ._laplace_ports import CurrentPorts


class LaplaceNDVI(CurrentPorts, LaplaceND):
    """
    Laplace block, voltage in -> current out (numerator / denominator form).
    H(s) = Iout / Vin is a transconductance (siemens).

    Same transfer function, coefficient order (highest power first), realisation,
    DC / AC / transient behaviour and limits as LaplaceND (voltage in -> voltage
    out); only the ports differ.

        H = LaplaceNDVI(inp, inn, outp, outn, num=[...], den=[...])
        e.g. ideal inductor current 1/(L s):  Y = LaplaceNDVI("v", "0", "0", "il", num=[1], den=[L, 0])

    Current input : the port (inp, inn) is a short circuit that measures the
                    current flowing inp -> inn; drive it from a current source.
    Current output: like every PyAMS current source, the current flows from outp
                    to outn THROUGH the block; to push current into node X use
                    outp = "0", outn = X.
    Parameter: Gain (extra gain factor, default 1).
    """
    kind = 'vi'


class LaplaceZPVI(CurrentPorts, LaplaceZP):
    """Zero-pole form of LaplaceNDVI (see LaplaceZP and LaplaceNDVI):
        H = LaplaceZPVI(inp, inn, outp, outn, zeros=[...], poles=[...], gain=K)
    """
    kind = 'vi'
