#-------------------------------------------------------------------------------
# Name:        555 timer, monostable (one-shot)
# Created:     19/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
# TRIG is held at Vcc; a negative pulse below Vcc/3 sets the flip-flop: the output
# goes high, the discharge transistor opens and C charges from 0 through R towards
# Vcc.  When V(C) reaches 2Vcc/3 the flip-flop is reset: output low, C discharged.
#       T = R C ln 3 = 1.0986 R C
# The trigger pulse must end before T (here it is 0.1 ms wide, T ~ 1.1 ms).

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import DCVoltage, TrapezoidVoltage, Resistor, Capacitor, Timer555

Vcc_, R_, C_ = 9.0, 10e3, 100e-9

def build(R=R_, C=C_):
    V = DCVoltage("Vcc", "0");   V.setParams("Vdc=%gV" % Vcc_)
    trg = TrapezoidVoltage("TRIG", "0")                     # Vcc, with negative pulses to 0
    trg.setParams("V0=%gV" % Vcc_); trg.setParams("V1=0V")
    trg.setParams("Td=1e-3"); trg.setParams("Tr=1e-6"); trg.setParams("Tw=1e-4")
    trg.setParams("Tf=1e-6"); trg.setParams("T=4e-3")
    r = Resistor("Vcc", "T");    r.setParams("R=%gΩ" % R)
    c = Capacitor("T", "0");     c.setParams("C=%gF" % C)
    cc = Capacitor("CT", "0");   cc.setParams("C=10nF")
    U = Timer555("TRIG", "T", "CT", "Vcc", "T", "OUT", "Vcc", "0")
    ck = circuit()
    ck.addElements({"V": V, "Trig": trg, "R": r, "C": c, "Cc": cc, "U": U})
    return ck

def pulse_width(k, tstop=9e-3):
    k.setOutPuts("T", "OUT", "TRIG")
    k.analysis(mode="tran", start=0, stop=tstop, step=1e-6, uic=True, adaptive=False, order=1)
    r = k.run()
    t, vo = np.array(r["time"]), np.array(r["OUT"])
    m = 0.5 * (vo.max() + vo.min())
    up = t[1:][(vo[:-1] < m) & (vo[1:] >= m)]
    dn = t[1:][(vo[:-1] >= m) & (vo[1:] < m)]
    return r, up, dn

ck = build()
r, up, dn = pulse_width(ck)
t, vt, vo, vtr = (np.array(r[k]) for k in ("time", "T", "OUT", "TRIG"))
T_ref = R_ * C_ * np.log(3.0)
w = dn - up[:len(dn)]
print("monostable 555 (Vcc = %g V, R = %g k, C = %g nF), trigger every 4 ms" % (Vcc_, R_ / 1e3, C_ * 1e9))
print("  pulses found: %d | widths sim %s us | ref R C ln3 = %.1f us" % (len(w), ", ".join("%.1f" % (x * 1e6) for x in w), T_ref * 1e6))
print("  capacitor peaks at %.3f V (2 Vcc/3 = %.3f V); trigger low = %.1f V" % (vt.max(), 2 * Vcc_ / 3, vtr.min()))

# pulse width versus R: parametric sweep (one run per value)
Rs = [5e3, 10e3, 20e3, 40e3]
print("  width vs R:")
for Rv in Rs:
    _, u, d = pulse_width(build(R=Rv), tstop=6e-3)
    print("    R = %4.0f k : sim %.1f us | ref %.1f us | error %.2f %%"
          % (Rv / 1e3, (d[0] - u[0]) * 1e6, Rv * C_ * np.log(3) * 1e6,
             100 * ((d[0] - u[0]) / (Rv * C_ * np.log(3)) - 1)))

surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
fig, axs = plt.subplots(3, 1, sharex=True, figsize=(9, 7.5), facecolor=surface)
for ax, y, col, name in zip(axs, (vtr, vt, vo), ('#1baf7a', '#2a78d6', '#eb6834'),
                            ('Trigger (pin 2)', 'Capacitor (pin 6/7)', 'Output (pin 3)')):
    ax.set_facecolor(surface); ax.plot(t * 1e3, y, color=col, lw=1.8)
    ax.set_title(name, loc='left', fontsize=10, color=ink2); ax.set_ylabel('Voltage (V)', color=ink2)
    ax.grid(axis='y', color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
axs[1].axhline(2 * Vcc_ / 3, color=axis_c, ls='--', lw=1)
axs[1].text(8.95, 2 * Vcc_ / 3 + 0.2, '2/3 Vcc', ha='right', color=ink2)
axs[2].text((up[0] + w[0] / 2) * 1e3, vo.max() / 2, 'T = %.2f ms' % (w[0] * 1e3), ha='center', color='white', fontsize=10)
axs[-1].set_xlabel('Time (ms)', color=ink2)
fig.suptitle('555 monostable (Vcc = 9 V, R = 10 k, C = 100 nF): T = R C ln3 = %.2f ms' % (T_ref * 1e3),
             x=0.01, ha='left', color=ink, fontsize=12)
fig.tight_layout(); fig.savefig("timer555_monostable.png", dpi=150, facecolor=surface)
