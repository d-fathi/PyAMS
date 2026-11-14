#-------------------------------------------------------------------------------
# Name:        Relay example (SPDT)
# Author:      d.fathi
# Created:     14/11/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT"
#-------------------------------------------------------------------------------
#   coil: 5 V pulse (30 ms high, 60 ms period) on a relay with Rc = 70 ohm, Lc = 0.1 H
#   contacts: common = 12 V supply;  nc -> 220 ohm -> gnd (lamp 1),  no -> 100 ohm -> gnd (lamp 2)
#
# At rest lamp 1 is on.  The coil current rises with tau = Lc/Rc; when it reaches the pull-in current
# Ion the armature starts to move and the contacts change Ton later (lamp 2 on).  When the pulse ends the
# current decays through the source (tau = Lc/Rc); below Ioff the armature is released Toff later.
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import TrapezoidVoltage, DCVoltage, Relay, Resistor

Rc, Lc, Ion, Ioff, Ton, Toff, Vc = 70.0, 0.1, 0.05, 0.01, 5e-3, 3e-3, 5.0
coil = TrapezoidVoltage("cp", "0"); coil.setParams("V0=0V V1=5V Td=5ms Tr=1us Tw=30ms Tf=1us T=60ms")
supply = DCVoltage("vs", "0"); supply.setParams("Vdc=12")
K = Relay("cp", "0", "vs", "no", "nc"); K.setParams("Rc=70 Lc=0.1 Ion=0.05 Ioff=0.01 Ton=5m Toff=3m")
Rno = Resistor("no", "0"); Rno.setParams("R=100")
Rnc = Resistor("nc", "0"); Rnc.setParams("R=220")

ckt = circuit()
ckt.addElements({"V1": coil, "VS": supply, "K1": K, "R1": Rno, "R2": Rnc})
ckt.setOutPuts("cp", "K1.I", "K1.pos", "no", "nc")
ckt.analysis(mode="tran", start=0, stop=130e-3, step=20e-6, adaptive=True, order=2,
             max_step=20e-6, lte=1e-4, uic=True)
r = ckt.run()
t = np.array(r["time"]); i = np.array(r["K1.I"]); pos = np.array(r["K1.pos"])
vno = np.array(r["no"]); vnc = np.array(r["nc"])

tau = Lc / Rc
t_pull_an = 5e-3 - tau * np.log(1 - Ion * Rc / Vc) + Ton                 # current reaches Ion, then Ton
t_rel_an = 35e-3 + tau * np.log((Vc / Rc) / Ioff) + Toff                  # current falls to Ioff, then Toff
def crossing(x, level, rising):
    k = np.where((x[:-1] < level) & (x[1:] >= level) if rising else (x[:-1] >= level) & (x[1:] < level))[0][0]
    return t[k] + (level - x[k]) / (x[k + 1] - x[k]) * (t[k + 1] - t[k])
t_pull = crossing(vno, 6.0, True); t_rel = crossing(vno, 6.0, False)
print("coil tau = Lc/Rc = %.3f ms, steady current = %.1f mA (Ion = %.0f mA, Ioff = %.0f mA)" % (1e3 * tau, 1e3 * Vc / Rc, 1e3 * Ion, 1e3 * Ioff))
print("contacts change (pull-in) at %.3f ms (analytic %.3f ms)" % (1e3 * t_pull, 1e3 * t_pull_an))
print("contacts return (release) at %.3f ms (analytic %.3f ms)" % (1e3 * t_rel, 1e3 * t_rel_an))
print("lamp voltages: energized no = %.3f V (12 V - contact drop), nc = %.1e V; rest: nc = %.3f V, no = %.1e V"
      % (vno[np.searchsorted(t, 30e-3)], vnc[np.searchsorted(t, 30e-3)], vnc[np.searchsorted(t, 2e-3)], vno[np.searchsorted(t, 2e-3)]))
print("analytic with Ron = 0.05 ohm: no = %.3f V, nc = %.3f V" % (12 * 100 / 100.05, 12 * 220 / 220.05))

ink, grid, surf = '#0b0b0b', '#e1e0d9', '#fcfcfb'
fig, ax = plt.subplots(3, 1, figsize=(9, 7.6), sharex=True, facecolor=surf)
for a in ax:
    a.set_facecolor(surf); a.grid(color=grid); a.tick_params(colors=ink)
ax[0].plot(t * 1e3, np.array(r["cp"]), color='#8a63d2'); ax[0].set_ylabel("coil V (V)"); ax[0].set_title("Coil voltage", color=ink)
ax[1].plot(t * 1e3, i * 1e3, color='#2a78d6', label="coil current")
ax[1].axhline(Ion * 1e3, color='#eb6834', ls='--', lw=1, label="Ion"); ax[1].axhline(Ioff * 1e3, color='#1baf7a', ls='--', lw=1, label="Ioff")
ax[1].plot(t * 1e3, pos * 10, color='#0b0b0b', lw=1, drawstyle='steps-post', label="armature (x10)")
ax[1].set_ylabel("mA"); ax[1].legend(fontsize=8, loc="upper right"); ax[1].set_title("Coil current, thresholds and armature position", color=ink)
ax[2].plot(t * 1e3, vnc, color='#eb6834', label="lamp 1 (nc)"); ax[2].plot(t * 1e3, vno, color='#1baf7a', label="lamp 2 (no)")
ax[2].set_ylabel("V"); ax[2].set_xlabel("t (ms)"); ax[2].legend(fontsize=8, loc="upper right"); ax[2].set_title("Contact outputs", color=ink)
fig.tight_layout(); fig.savefig("relay_example.png", dpi=130, facecolor=surf)
