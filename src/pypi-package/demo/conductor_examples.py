#-------------------------------------------------------------------------------
# Name:        Conductor: resistance from geometry, temperature and self-heating
# Updated:     21/10/2026
# Copyright:   (c) PyAMS
# Licence:     free  "MIT  "
#-------------------------------------------------------------------------------
#   R = Rho Len / Area (1 + Alpha (T - T0)),   T = Tamb (+ DT with thermal=True)
#   Cth d(DT)/dt = V^2 / R - DT / Rth
# Checks:
#   1. resistance of copper wires from the geometry (a table of lengths and sections)
#   2. resistance against the ambient temperature (Tamb sweep)
#   3. self-heating of a tungsten filament (lamp): I(V) curve and the DC temperature
#      against a numerical solution of the same equations
#   4. lamp switch-on: inrush current while the filament heats up, against scipy

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from scipy.optimize import brentq
from pyams.lib import circuit
from pyams.models import DCVoltage, TrapezoidVoltage, Resistor, Conductor

CU = dict(Rho=1.68e-8, Alpha=3.93e-3)

def dc_current(cond, vdc, out="C1.I"):
    V = DCVoltage("a", "0"); V.setParams("Vdc=%.12gV" % vdc)
    c = circuit(); c.addElements({"V": V, "C1": cond}); c.setOutPuts(out); c.analysis(mode="dc")
    return float(c.run()[out][0])

# ---- 1. geometry ---------------------------------------------------------------------------
print("1) copper wires (Rho = 1.68e-8 ohm m, 20 C, ambient 20 C): R measured as V/I at 1 V")
for name, L, A in (("1 m of 1 mm2", 1.0, 1e-6), ("100 m of 1.5 mm2", 100.0, 1.5e-6),
                   ("PCB track 50 mm x 0.25 mm x 35 um", 0.05, 0.25e-3 * 35e-6), ("10 km of 50 mm2", 1e4, 50e-6)):
    W = Conductor("a", "0"); W.setParams("Len=%g Area=%g Tamb=20" % (L, A))
    R = 1.0 / dc_current(W, 1.0)
    print("   %-36s R = %.6g ohm | Rho L / A = %.6g ohm" % (name, R, 1.68e-8 * L / A))

# ---- 2. temperature ------------------------------------------------------------------------------
print("2) 100 m of 1.5 mm2 copper against the ambient temperature")
for T in (-40, 20, 25, 70, 150):
    W = Conductor("a", "0"); W.setParams("Len=100 Area=1.5e-6 Tamb=%g" % T)
    R = 1.0 / dc_current(W, 1.0); Rr = 1.68e-8 * 100 / 1.5e-6 * (1 + 3.93e-3 * (T - 20))
    print("   Tamb = %4d C : R = %.4f ohm (formula %.4f ohm)" % (T, R, Rr))

# ---- 3. self-heating, tungsten filament ---------------------------------------------------------
Rho_w, Al_w, L_w, A_w = 5.6e-8, 4.5e-3, 0.5, 1.4e-9          # a 0.5 m coiled filament, ~42 um wire
Rth, Cth, Ta, T0 = 400.0, 0.02, 25.0, 20.0                    # K/W, J/K
R20 = Rho_w * L_w / A_w
def make(thermal=True):
    W = Conductor("a", "0", thermal=thermal)
    W.setParams("Rho=%g Alpha=%g Len=%g Area=%g Rth=%g Cth=%g Tamb=%g T0=%g" % (Rho_w, Al_w, L_w, A_w, Rth, Cth, Ta, T0))
    return W
def ref_dc(v):
    f = lambda dT: v * v / (R20 * (1 + Al_w * (Ta + dT - T0))) - dT / Rth
    dT = brentq(f, 0, 5000)
    return dT, v / (R20 * (1 + Al_w * (Ta + dT - T0)))
print("3) tungsten filament: R(20 C) = %.1f ohm, Rth = %g K/W, Cth = %g J/K" % (R20, Rth, Cth))
volts = np.linspace(0.5, 24, 48)
cs, dts, ir, dr = [], [], [], []
V = DCVoltage("a", "0"); W = make()
c = circuit(); c.addElements({"V": V, "C1": W}); c.setOutPuts("C1.I", "C1.DT")
c.analysis(mode="dc", param="V.Vdc", start=0.5, stop=24.0, step=0.5)
r = c.run(); v_s, i_s, dT_s = np.array(r["sweep"]), np.array(r["C1.I"]), np.array(r["C1.DT"])
ref = np.array([ref_dc(v) for v in v_s])
print("   DC sweep 0.5..24 V: max |dT_sim - dT_ref| = %.2e K, max relative |I_sim - I_ref| = %.1e" %
      (np.max(np.abs(dT_s - ref[:, 0])), np.max(np.abs(i_s - ref[:, 1]) / ref[:, 1])))
k = np.argmin(np.abs(v_s - 12))
print("   at 12 V: DT = %.1f K (T = %.0f C), I = %.2f mA, R = %.1f ohm vs the cold R(25 C) = %.1f ohm"
      % (dT_s[k], Ta + dT_s[k], i_s[k] * 1e3, v_s[k] / i_s[k], R20 * (1 + Al_w * (Ta - T0))))

# ---- 4. switch-on --------------------------------------------------------------------------------
Vsrc = TrapezoidVoltage("a", "0"); Vsrc.setParams("V0=0V V1=12V Td=0.1 Tr=1u Tw=100 Tf=1u T=200")
c = circuit(); c.addElements({"V": Vsrc, "C1": make()}); c.setOutPuts("C1.I", "C1.DT")
c.analysis(mode="tran", start=0, stop=40.0, step=0.1, adaptive=True, order=2, max_step=0.01)
rt = c.run(); t, it, dTt = rt["time"], np.array(rt["C1.I"]), np.array(rt["C1.DT"])
def rhs(tt, y):
    v = 12.0 if tt >= 0.1 else 0.0
    return [(v * v / (R20 * (1 + Al_w * (Ta + y[0] - T0))) - y[0] / Rth) / Cth]
sol = solve_ivp(rhs, [0, 40.0], [0.0], t_eval=t, method="Radau", rtol=1e-9, atol=1e-9, max_step=1e-3)
i_ref = np.where(t >= 0.1, 12.0 / (R20 * (1 + Al_w * (Ta + sol.y[0] - T0))), 0.0)
m = t > 0.101
dT_final, I_final = ref_dc(12.0)
print("4) switch-on at 12 V: the cold inrush %.1f mA falls to %.1f mA (DC solution %.1f mA), ratio %.1f; max |DT_sim - DT_ref| = %.3f K"
      % (12.0 / (R20 * (1 + Al_w * (Ta - T0))) * 1e3, it[-1] * 1e3, I_final * 1e3,
         12.0 / (R20 * (1 + Al_w * (Ta - T0))) / it[-1], np.max(np.abs(dTt - sol.y[0]))))
print("   63%% of the final temperature rise is reached %.2f s after the switch-on (Rth Cth = %.1f s is the small-signal value without the"
      " resistance feedback: the rise slows as R grows)" % (t[np.argmax(dTt >= 0.632 * dTt[-1])] - 0.1, Rth * Cth))
print("   without thermal=True the lamp would draw a constant %.1f mA" % (12.0 / (R20 * (1 + Al_w * (Ta - T0))) * 1e3))

# ---- figure -----------------------------------------------------------------------------------------
surface, ink, ink2, grid, axis_c = '#fcfcfb', '#0b0b0b', '#52514e', '#e1e0d9', '#c3c2b7'
cols = ['#2a78d6', '#eb6834', '#1baf7a']
fig, axs = plt.subplots(1, 3, figsize=(15, 4.6), facecolor=surface)
def style(ax):
    ax.set_facecolor(surface); ax.grid(color=grid, lw=0.8); ax.set_axisbelow(True)
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'): ax.spines[s].set_color(axis_c)
    ax.tick_params(colors=ink2)
for ax in axs: style(ax)
ax = axs[0]
ax.plot(v_s, i_s * 1e3, color=cols[0], lw=2, label='with self-heating')
ax.plot(v_s, v_s / (R20 * (1 + Al_w * (Ta - T0))) * 1e3, color=axis_c, lw=1.4, ls='--', label='cold resistance')
ax.set_xlabel('V (V)', color=ink2); ax.set_ylabel('I (mA)', color=ink2); ax.legend(frameon=False, labelcolor=ink2)
ax.set_title('Tungsten filament I(V)', loc='left', color=ink, fontsize=11)
ax = axs[1]
ax.plot(v_s, Ta + dT_s, color=cols[1], lw=2)
ax.set_xlabel('V (V)', color=ink2); ax.set_ylabel('Filament temperature (°C)', color=ink2)
ax.set_title('Temperature in steady state', loc='left', color=ink, fontsize=11)
ax = axs[2]
ax.plot(t, it * 1e3, color=cols[0], lw=2, label='I (PyAMS)')
ax.plot(t[::20], i_ref[::20] * 1e3, 'o', color=cols[1], ms=3.5, label='scipy')
ax.set_xlabel('Time (s)', color=ink2); ax.set_ylabel('I (mA)', color=ink2); ax.legend(frameon=False, labelcolor=ink2)
ax.set_title('Switch-on at 12 V: inrush current', loc='left', color=ink, fontsize=11)
fig.tight_layout(); fig.savefig("conductor_examples.png", dpi=150, facecolor=surface)
