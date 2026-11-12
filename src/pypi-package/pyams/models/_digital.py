#-------------------------------------------------------------------------------
# Name:        Helpers shared by the digital models (dsignal front end)
# Updated:     12/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
from pyams.lib import dsignal


def pins(owner, attr, nodes, width, direction):
    """dsignal from a node name (``width`` bits: name[0] ... name[n-1]) or from a
    list of node names (LSB first)."""
    if isinstance(nodes, (list, tuple)) and width is None:
        return dsignal(direction, list(nodes))
    return dsignal(direction, nodes, width=width)
