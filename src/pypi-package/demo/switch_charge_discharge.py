#-------------------------------------------------------------------------------
# Name:        Capacitor charge / discharge controlled by a switch
# Updated:     12/11/2026
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#
#   Vs ──[ SW ]──[ R1 ]──┬── Out        SW closed (Vc > Vt)  -> C charges from Vs through R1
#                        │              SW open   (Vc < Vt)  -> C discharges through R2
#                      [ C ]  [ R2 ]
#                        │      │
#                       gnd    gnd
#
# Vc is a 5 V pulse (period 10 ms, 5 ms high).  Closed: C charges towards
# Vs R2/(R1+R2) with tau1 = (R1 || R2) C.  Open: C discharges towards 0 with tau2 = R2 C.
# The same circuit is built twice, with Switch (Ron / Roff) and with SwitchV (ideal 0 V
# source / open circuit); both are compared with the analytic solution.
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pyams.lib import circuit
from pyams.models import (TrapezoidVoltage, DCVoltage, Switch, SwitchV, Resistor, Capacitor)

Vs, R1, R2, C = 5.0, 1e3, 2e3, 1e-6
Td, Tr, Tw, Tf, T = 1e-3, 10e-6, 5e-3, 10e-6, 10e-3
Vt = 2.5

ctrl = TrapezoidVoltage("vc", "0"); ctrl.setParams("V0=0V V1=5V Td=1ms Tr=10us Tw=5ms Tf=10us T=10ms")
src = DCVoltage("vs", "0"); src.setParams("Vdc=5")
sw1 = Switch("vs", "a1", "vc", "0");  sw1.setParams("Vt=2.5 Ron=1m Roff=1G")       # model 1
ra1 = Resistor("a1", "o1"); ra1.setParams("R=1k")
rb1 = Resistor("o1", "0");  rb1.setParams("R=2k")
c1 = Capacitor("o1", "0");  c1.setParams("C=1u")
sw2 = SwitchV("vs", "a2", "vc", "0"); sw2.setParams("Vt=2.5")                      # model 2
ra2 = Resistor("a2", "o2"); ra2.setParams("R=1k")
rb2 = Resistor("o2", "0");  rb2.setParams("R=2k")
c2 = Capacitor("o2", "0");  c2.setParams("C=1u")

ckt = circuit()
ckt.addElements({"VC": ctrl, "VS": src, "SW1": sw1, "RA1": ra1, "RB1": rb1, "C1": c1,
                 "SW2": sw2, "RA2": ra2, "RB2": rb2, "C2": c2})
ckt.setOutPuts("vc", "o1", "o2", "SW2.I")
ckt.analysis(mode="tran", start=0, stop=40e-3, step=10e-6, adaptive=True, order=2,
             max_step=50e-6, lte=1e-5, uic=True)
res = ckt.run()
t = np.array(res["time"]); vc = np.array(res["vc"])
o1 = np.array(res["o1"]); o2 = np.array(res["o2"]); isw = np.array(res["SW2.I"])

# ---- analytic solution: exact exponentials between the switching instants
tau1 = R1 * R2 / (R1 + R2) * C; tau2 = R2 * C; vf = Vs * R2 / (R1 + R2)
edges = [0.0]
for k in range(4):                                       # threshold crossings of the trapezoid
    edges += [Td + k * T + Tr * Vt / 5.0, Td + k * T + Tr + Tw + Tf * (1 - Vt / 5.0)]
edges.append(40e-3)
v_an = np.zeros_like(t); v0 = 0.0; k = 0
for i in range(len(edges) - 1):
    closed = (i % 2 == 1)
    m = (t >= edges[i]) & (t < edges[i + 1] + (1e-15 if i == len(edges) - 2 else 0))
    dt = t[m] - edges[i]
    v_an[m] = (vf + (v0 - vf) * np.exp(-dt / tau1)) if closed else v0 * np.exp(-dt / tau2)
    dte = edges[i + 1] - edges[i]
    v0 = (vf + (v0 - vf) * np.exp(-dte / tau1)) if closed else v0 * np.exp(-dte / tau2)

e1 = np.max(np.abs(o1 - v_an)); e2 = np.max(np.abs(o2 - v_an)); e12 = np.max(np.abs(o1 - o2))
print("charge: tau1 = (R1||R2) C = %.0f us, final value Vs R2/(R1+R2) = %.3f V" % (1e6 * tau1, vf))
print("discharge: tau2 = R2 C = %.0f us" % (1e6 * tau2))
print("Switch  vs analytic: max |error| = %.4f V" % e1)
print("SwitchV vs analytic: max |error| = %.4f V" % e2)
print("Switch vs SwitchV   : max |difference| = %.4f V" % e12)
i_an = np.where(vc > Vt, (Vs - o2) / R1, 0.0)
mid = np.abs(vc - Vt) > 0.3
print("SwitchV current = (Vs - V_C)/R1 while closed, 0 while open: max |error| = %.2e A, peak %.2f mA"
      % (np.max(np.abs(isw[mid] - i_an[mid])), 1e3 * isw.max()))

ink, grid, surf = '#0b0b0b', '#e1e0d9', '#fcfcfb'
fig, ax = plt.subplots(3, 1, figsize=(9, 7.2), sharex=True, facecolor=surf)
for a in ax:
    a.set_facecolor(surf); a.grid(color=grid); a.tick_params(colors=ink)
ax[0].plot(t * 1e3, vc, color='#8a63d2'); ax[0].axhline(Vt, color='#eb6834', ls='--', lw=1)
ax[0].set_ylabel("Vc (V)"); ax[0].set_title("Control pulse (switch closed above Vt = 2.5 V)", color=ink)
ax[1].plot(t * 1e3, o1, color='#2a78d6', label="Switch"); ax[1].plot(t * 1e3, o2, color='#1baf7a', ls=':', lw=2, label="SwitchV")
ax[1].plot(t * 1e3, v_an, color='#eb6834', ls='--', lw=1, label="analytic")
ax[1].axhline(vf, color=grid, lw=1); ax[1].legend(fontsize=8, loc="upper right")
ax[1].set_ylabel("V_C (V)"); ax[1].set_title("Capacitor: charges when closed, discharges when open", color=ink)
ax[2].plot(t * 1e3, isw * 1e3, color='#2a78d6'); ax[2].set_ylabel("I switch (mA)"); ax[2].set_xlabel("t (ms)")
ax[2].set_title("Switch current (SwitchV branch current)", color=ink)
fig.tight_layout(); fig.savefig("switch_charge_discharge.png", dpi=130, facecolor=surf)
