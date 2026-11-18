#-------------------------------------------------------------------------------
# Name:        wave
# Author:      d.fathi
# Created:     18/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
"""Logic waveform viewer (like the wave window of VHDL simulators).

    from pyams.wave import plot_wave
    fig = plot_wave(result, [
        "clk",                                   # one bit: step trace 0/1
        ("count", ["q0", "q1", "q2"]),           # bus: bit 0 = LSB first, hex value in a box
        ("data",  ["d0", "d1"], "bin"),          # bus shown in binary ('hex' | 'bin' | 'dec')
        ("vout",  ["vin", "vout"], "analog"),    # analog trace(s) in the same window
    ], vth=2.5, filename="wave.png")

``result``  : the dict returned by circuit.run() (must contain 'time').
``rows``    : name | (label, name_or_list[, kind]).  The signals of a bus are listed
              LSB first; a voltage is a logic 1 when it is above ``vth``
              (default: half of the largest voltage of the row).
              A bus value is 'X' where one of its bits is between ``vl`` and ``vh``
              at the sampling instant (undefined level).
``show``    : True -> plt.show() (an interactive window); the figure is returned anyway,
              so plt.show() can also be called by hand.  ``filename`` saves a png.
``tlim``     : (t0, t1) zoom window, in the displayed unit (after tscale).
``vth``     : logic threshold in volts (or a (vl, vh) pair for an X band).
"""
import numpy as np


def _bits(res, names, vth):
    vl, vh = vth if isinstance(vth, (tuple, list)) else (vth, vth)
    t = np.asarray(res['time'], float)
    out = []
    for n in names:
        v = np.asarray(res[n], float)
        out.append((v > vh).astype(int) - np.where((v >= vl) & (v <= vh) & (vl != vh), 2, 0))
    return t, out                      # value 1 / 0 ; <0 means undefined (X)


def _segments(t, bits):
    """[(t0, t1, value or None)] constant segments of a bus (bit0 = LSB)."""
    val = np.zeros(len(t), int)
    und = np.zeros(len(t), bool)
    for i, b in enumerate(bits):
        und |= b < 0
        val |= (np.where(b > 0, 1, 0) << i)
    seg, s = [], 0
    key = np.where(und, -1, val)
    for k in range(1, len(t)):
        if key[k] != key[s]:
            seg.append((t[s], t[k], None if key[s] < 0 else int(key[s])))
            s = k
    seg.append((t[s], t[-1], None if key[s] < 0 else int(key[s])))
    return seg


def plot_wave(res, rows, vth=None, tscale=1.0, tunit='s', title=None, filename=None, show=False, tlim=None,
              colors=('#2a78d6', '#eb6834', '#1baf7a', '#8a63d2'), width=10.0, row_h=0.75):
    import matplotlib.pyplot as plt
    from matplotlib.patches import Polygon

    surf, ink, grid = '#fcfcfb', '#0b0b0b', '#e1e0d9'
    t = np.asarray(res['time'], float) * tscale
    fig, axs = plt.subplots(len(rows), 1, sharex=True, facecolor=surf,
                            figsize=(width, max(2.0, row_h * len(rows) + 0.8)))
    axs = np.atleast_1d(axs)
    for r, (ax, row) in enumerate(zip(axs, rows)):
        if isinstance(row, str):
            row = (row, row)
        label, names = row[0], row[1]
        kind = row[2] if len(row) > 2 else None
        names = [names] if isinstance(names, str) else list(names)
        col = colors[r % len(colors)]
        ax.set_facecolor(surf)
        for s in ('top', 'right', 'left'):
            ax.spines[s].set_visible(False)
        ax.set_yticks([]); ax.grid(axis='x', color=grid, lw=.6)
        ax.set_ylabel(label, rotation=0, ha='right', va='center', color=ink, fontsize=9)
        if kind == 'analog':
            for k, n in enumerate(names):                      # several analog traces
                ax.plot(t, np.asarray(res[n], float), lw=1.3, label=n,
                        color=colors[(r + k) % len(colors)])
            if len(names) > 1:
                ax.legend(loc='upper right', fontsize=7, frameon=False, ncol=len(names))
            continue
        th = vth if vth is not None else 0.5 * max(float(np.max(res[n])) for n in names)
        t0, bits = _bits(res, names, th)
        if len(names) == 1 and kind is None:                       # single bit
            b = bits[0]
            ax.step(t, np.where(b > 0, 1, 0), where='post', color=col, lw=1.5)
            if (b < 0).any():
                ax.fill_between(t, 0, 1, where=(b < 0), step='post', color='#d03b3b', alpha=.4)
            ax.set_ylim(-0.2, 1.2)
        else:                                                         # bus
            fmt = kind or 'hex'
            ax.set_ylim(0, 1)
            for a, z, v in _segments(t, bits):
                d = min((z - a) * 0.15, (t[-1] - t[0]) * 0.004)
                poly = [(a, .5), (a + d, .9), (z - d, .9), (z, .5), (z - d, .1), (a + d, .1)]
                bad = v is None
                ax.add_patch(Polygon(poly, closed=True, fill=bad, fc='#d03b3b' if bad else 'none',
                                     alpha=.4 if bad else 1, ec=col, lw=1.2))
                txt = 'X' if bad else {'hex': '%X' % v, 'bin': format(v, '0%db' % len(names)),
                                        'dec': str(v)}[fmt]
                ax.text((a + z) / 2, .5, txt, ha='center', va='center', color=ink, fontsize=8,
                        clip_on=True)
    axs[-1].set_xlabel('t (%s)' % tunit, color=ink)
    axs[-1].set_xlim(*(tlim if tlim else (t[0], t[-1])))
    if title:
        fig.suptitle(title, color=ink)
    fig.tight_layout(h_pad=0.2)
    if filename:
        fig.savefig(filename, dpi=130, facecolor=surf)
    if show:
        plt.show()
    return fig
