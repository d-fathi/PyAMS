#-------------------------------------------------------------------------------
# Name:        Thyristor lamp dimmer (half-wave phase control, three angles)
# Created:     18/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "GPLv3"
#-------------------------------------------------------------------------------
# VAC -> lamp load -> SCR (anode a, cathode k = common return), gate pulse g.
# The pulse fires the SCR at the angle theta after the start of every positive
# half-cycle; the lamp then conducts until the current falls to zero.
# The later the pulse (theta1 < theta2 < theta3) the dimmer the lamp.
#   lamp power  P = Vm^2 / (4 pi R) * [(pi - theta) + sin(2 theta) / 2]
# (the lamp is a resistor: R = 800 Ohm, about a 60 W / 220 V lamp).

import numpy as np
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import SinVoltage, TrapezoidVoltage, Resistor, Thyristor

f, Vm, R = 50.0, 311.0, 800.0
T = 1.0 / f
thetas = [45.0, 90.0, 135.0]                         # firing angles (degrees)
delays = [th / 360.0 * T for th in thetas]            # gate pulse delay (s)

Vac = SinVoltage("s", "0");    Vac.setParams("Va=%gV Fr=%gHz" % (Vm, f))
Lamp = Resistor("s", "a");     Lamp.setParams("R=%gΩ" % R)
SCR = Thyristor("a", "g", "0")
Vg = TrapezoidVoltage("gd", "0")                      # gate trigger pulse train
Vg.setParams("V0=0V V1=5V Td=1ms Tr=1us Tw=300us Tf=1us T=20ms")
Rg = Resistor("gd", "g");      Rg.setParams("R=100Ω")

cir = circuit()
cir.addElements({"Vac": Vac, "Lamp": Lamp, "SCR": SCR, "Vg": Vg, "Rg": Rg})
cir.setOutPuts("s", "Lamp.I", "gd")
cir.analysis(mode="tran", start=0, stop=3 * T, step=2e-5,
             adaptive=True, order=2, max_step=5e-5)
cir.sweep(param="Vg.Td", list=delays)
results = cir.run()

# ---- lamp power against the formula (the 2nd and 3rd cycles) -------------------
for th, r in zip(thetas, results):
    t, il = r["time"], r["Lamp.I"]
    m = t >= T
    p_sim = np.mean(il[m] ** 2) * R
    a = np.radians(th)
    p_ref = Vm ** 2 / (4 * np.pi * R) * ((np.pi - a) + np.sin(2 * a) / 2)
    print("theta = %5.1f deg : lamp power %.2f W (formula %.2f W), "
          "peak current %.3f A" % (th, p_sim, p_ref, il[m].max()))

# ---- figure in the style of the textbook drawing -----------------------------------
surface, ink, ink2, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#c3c2b7'
blue, fill, purple = '#2a78d6', '#cfe0f6', '#8f7bd0'
fig = plt.figure(figsize=(9, 9.2), facecolor=surface)
gs = fig.add_gridspec(6, 1, height_ratios=[3, 1, 3, 1, 3, 1], hspace=0.35)
for k, (th, r) in enumerate(zip(thetas, results)):
    ax = fig.add_subplot(gs[2 * k]); ag = fig.add_subplot(gs[2 * k + 1], sharex=ax)
    t = r["time"] * 1e3; il = r["Lamp.I"]; vs = r["s"] / R       # Vs/R: no SCR
    ax.set_facecolor(surface); ag.set_facecolor(surface)
    ax.plot(t, vs, color=blue, lw=1.2, ls=(0, (2, 2)), alpha=0.8,
            label='Vs / R (current without the SCR)')
    ax.fill_between(t, 0, il, where=il > 1e-3, color=fill, zorder=1)
    ax.plot(t, il, color=blue, lw=2.2, zorder=2, label='lamp current IL')
    ax.axhline(0, color=ink, lw=0.8)
    ax.set_ylim(-1.15 * Vm / R, 1.2 * Vm / R); ax.set_ylabel('IL (A)', color=ink2)
    # theta: from the start of the half-cycle to the gate pulse
    td = delays[k] * 1e3
    for c in range(3):
        x0, x1 = c * T * 1e3, c * T * 1e3 + td
        ax.annotate('', (x1, 1.02 * Vm / R), (x0, 1.02 * Vm / R),
                    arrowprops=dict(arrowstyle='<->', color=ink2, lw=0.9))
        ax.axvline(x1, color=ink2, lw=0.8, ls='--', ymax=0.96)
        ax.text((x0 + x1) / 2, 1.07 * Vm / R, '$\\theta_%d$' % (k + 1),
                color=ink2, ha='center', fontsize=10)
    ax.text(0.99, 0.9, 'theta%d = %g deg   (lamp %.0f W)' % (
        k + 1, th, np.mean(il[t >= T * 1e3] ** 2) * R),
        transform=ax.transAxes, ha='right', color=ink2, fontsize=9)
    ag.fill_between(t, 0, r["gd"], step='mid', color=purple, alpha=0.8)
    ag.set_ylim(-0.5, 7); ag.set_yticks([]); ag.set_ylabel('gate', color=ink2)
    for a_ in (ax, ag):
        for s in ('top', 'right'): a_.spines[s].set_visible(False)
        for s in ('left', 'bottom'): a_.spines[s].set_color(axis_c)
        a_.tick_params(colors=ink2)
    plt.setp(ax.get_xticklabels(), visible=False)
    if k == 0:
        ax.legend(frameon=False, labelcolor=ink2, loc='lower left', fontsize=8)
    if k < 2:
        plt.setp(ag.get_xticklabels(), visible=False)
ag.set_xlabel('Time (ms)', color=ink2)
fig.suptitle('SCR lamp dimmer: conduction angle against the firing angle', x=0.01,
             ha='left', color=ink, fontsize=12)
fig.savefig("thyristor_lamp_dimmer.png", dpi=140, facecolor=surface,
            bbox_inches='tight')
