# PyAMS
 Python library for analog and mixed-signal simulation (PyAMS Library)

<h1 align="center">
    <a href="https://pypi.org/project/pyams_lib/"><img src="https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/images/logo.png" width="150px" alt="PyAMS-lib"></a>
</h1>

---

<p align="center">

<a href="https://pyams-lib.readthedocs.io/">
    <img src="https://img.shields.io/badge/docs-PyAMS--lib-blue?logo=readthedocs" alt="PyAMS-lib Docs">
</a>

 <a href="#News">
    <img src="https://img.shields.io/badge/Version-0.6.0-blue" alt="v0.6.0">
 </a>
  <a href="#Installation">
      <img src="https://img.shields.io/badge/Python->=3-blue" alt="Python 3+">
  </a>

  <a href="#Installation">
      <img src="https://img.shields.io/badge/PyPy->=3-blue" alt="PyPy 3+">
  </a>

  <a href="https://github.com/d-fathi/pyams_lib/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License">
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/rlc_result.png" width="32%" alt="Transient analysis">
  <img src="https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/ac_rlc.png" width="32%" alt="AC analysis">
  <img src="https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/jfet_curves.png" width="32%" alt="DC sweep">
</p>

# PyAMS Library

## What is `pyams-lib`?

`pyams_lib` is a Python package designed to simplify the modeling of analog and digital elements and the simulation of electronic circuits. It provides:

- The ability to create custom models of electrical components.
- Simulation of circuits in different modes of operation (DC, DC sweep, transient, AC).
- Digital and mixed-signal models (gates, flip-flops, counters, buses with `dsignal`, DAC / ADC) solved together with the analog circuit.
- Hierarchical models: a model made of other models with internal nodes (`subcircuit()`).
- Visualization of simulation results using `matplotlib`, including a logic waveform viewer (`plot_wave`).
- Compatibility with Python 3+, working across Linux, Windows, and macOS.
- PyAMS library (pyams_lib) documentation   <a href="https://pyams-lib.readthedocs.io/">https://pyams-lib.readthedocs.io/</a>.
- For circuit design using the CAD system, visit the software section at <a href='https://pyams.sf.net/'>https://pyams.sf.net</a>.

## Installation

```sh
pip install pyams_lib
```

To upgrade to the latest version:

```sh
pip install --upgrade pyams_lib
```

Requires Python 3 with `numpy` and `matplotlib`.

---

## Contents

1. [Quick start](#1-quick-start)
2. [Modeling](#2-modeling)
   - [Building a circuit](#21-building-a-circuit)
   - [Setting parameters](#22-setting-parameters)
   - [Writing your own model](#23-writing-your-own-model)
   - [Hierarchical models: `subcircuit()`](#24-hierarchical-models-subcircuit)
   - [Digital models and buses: `dsignal`](#25-digital-models-and-buses-dsignal)
3. [Analysis](#3-analysis)
   - [DC operating point](#31-dc-operating-point)
   - [DC sweep](#32-dc-sweep)
   - [Transient](#33-transient-analysis)
   - [AC (small signal)](#34-ac-small-signal-analysis)
   - [Parametric sweep](#35-parametric-sweep)
4. [Showing the results](#4-showing-the-results)
   - [Logic waveform viewer: `plot_wave`](#logic-waveform-viewer-plot_wave)
5. [Built-in models](#5-built-in-models)
   - [Switches and relay](#switches-and-relay)
   - [Laplace blocks](#laplace-blocks)
   - [Digital blocks](#digital-blocks)
6. [More examples](#6-more-examples)

---

## 1. Quick start

A half-wave rectifier: a 10 V / 2 Hz sine source, a diode and a 1 kΩ load.

```python
from pyams.lib import circuit
from pyams.models import Resistor, SinVoltage, Diode

# 1. create the elements; the arguments are node names ("0" is ground)
V1 = SinVoltage("In", "0")
D1 = Diode("In", "Out")
R1 = Resistor("Out", "0")

# 2. set their parameters
V1.setParams("Va=10V Fr=2Hz")
R1.setParams("R=1KΩ")

# 3. build the circuit and choose what to record
cir = circuit()
cir.addElements({"V1": V1, "D1": D1, "R1": R1})
cir.setOutPuts("In", "Out")

# 4. choose an analysis, run it, plot
cir.analysis(mode="tran", start=0, stop=2, step=0.001)
cir.run()
cir.plot()
```

The five steps — **elements → parameters → circuit → analysis → results** — are the same
for every circuit.

---

## 2. Modeling

### 2.1 Building a circuit

An element is created with the names of the nodes its terminals are connected to.
Two elements that use the same node name are connected there. The names `"0"`,
`"gnd"` and `"ground"` all mean the reference node.

```python
R1 = Resistor("In", "N1")      # between node In and node N1
C1 = Capacitor("N1", "0")      # between node N1 and ground
```

Elements are then added to a `circuit` as a dictionary `{name: element}`.
The element name is used later to select parameters and signals
(for example `"R1.R"` or `"D1.I"`):

```python
cir = circuit()
cir.addElements({"V1": V1, "R1": R1, "C1": C1})
```

`cir.setOutPuts(...)` selects what is recorded and plotted. It accepts

| Output name | Meaning                                            |
|-------------|----------------------------------------------------|
| `"Out"`     | voltage of node `Out`                              |
| `"R1.I"`    | a signal of an element: `Element.signal` (current) |
| `"R1.V"`    | voltage across the element                         |

If `setOutPuts` is not called, all node voltages are recorded.

### 2.2 Setting parameters

Parameters are set with a string of `name=value` pairs. Values accept engineering
prefixes (`T G Meg k m u n p f`) and optional units:

```python
R1.setParams("R=4.7KΩ")
V1.setParams("Va=5V Fr=50Hz")
C1.setParams("C=100nF")
L1.setParams(L=10e-3)                 # keyword arguments also work
D1.setParams({"Iss": 1e-12, "n": 1.5})  # ... and so does a dict
```

`element.getParams()` returns every parameter with its unit and description;
an unknown parameter name raises an error that lists the valid ones.

### 2.3 Writing your own model

A model is a class derived from `model`.

- `__init__` receives the terminals (node names), declares the **signals** and the **parameters**.
- `analog()` holds the equations.

```python
from math import exp
from pyams.lib import model, signal, param, voltage, current

class MyDiode(model):
    def __init__(self, p, n):
        self.V = signal('in',  voltage, p, n)     # read:  V = v(p) - v(n)
        self.I = signal('out', current, p, n)     # write: current p -> n
        self.Is = param(1e-14,   'A', 'Saturation current')
        self.Vt = param(0.02585, 'V', 'Thermal voltage')

    def analog(self):
        self.I += self.Is * (exp(self.V / self.Vt) - 1)
```

Use it exactly like a built-in element:

```python
V1 = DCVoltage("In", "0");  V1.setParams("Vdc=5V")
R1 = Resistor("In", "A");   R1.setParams("R=1KΩ")
D1 = MyDiode("A", "0")

cir = circuit()
cir.addElements({"V1": V1, "R1": R1, "D1": D1})
cir.setOutPuts("A", "D1.I")
cir.analysis(mode="dc")
print(cir.run())      # {'time': [0.], 'A': [0.692...], 'D1.I': [0.0043...]}
```

**Signals** — `signal(direction, kind, p, n)`

| Declaration                  | Meaning                                                                 |
|------------------------------|-------------------------------------------------------------------------|
| `signal('in',  voltage, p, n)` | the value of `v(p) - v(n)`; read it inside `analog()`                  |
| `signal('out', current, p, n)` | `sig += x` adds a current `x` flowing from `p` to `n` through the element |
| `signal('out', voltage, p, n)` | `sig += x` imposes `v(p) - v(n) = x` (an ideal voltage source)         |
| `signal('in',  current, p, n)` | the current of the `('out', voltage)` signal on the same two nodes (current-controlled elements) |

**Time derivatives.** Inside `analog()`, `ddt(x)` is the time derivative of `x`
(it is 0 in DC), and `idt(x)` its integral. Signals, parameters and `time` behave
like ordinary floats, so `math.exp`, `math.sin`, … can be applied directly.
A capacitor, for instance, is just:

```python
from pyams.lib import ddt

class MyCap(model):
    def __init__(self, p, n):
        self.V = signal('in',  voltage, p, n)
        self.I = signal('out', current, p, n)
        self.C = param(1e-6, 'F', 'Capacitance')

    def analog(self):
        self.I += self.C * ddt(self.V)
```

You only write the equations — the solver builds and linearises the system
(modified nodal analysis with Newton–Raphson; the Jacobian is obtained by finite
differences of `analog()`), so no derivatives have to be coded by hand.

### 2.4 Hierarchical models: `subcircuit()`

A model can be built from other models. Define `subcircuit()` in an ordinary `model`
class: `self.node(name)` creates an internal node of the instance and
`self.add(name, element, **params)` adds a sub-model (which may itself contain
sub-models, to any depth).

```python
from pyams.lib import model, param
from pyams.models import Resistor, Capacitor

class RCLadder(model):
    def __init__(self, inp, out, gnd="0"):
        self.inp, self.out, self.gnd = inp, out, gnd          # terminals
        self.R = param(1e3, 'Ω', 'Resistance of a section')
        self.C = param(1e-6, 'F', 'Capacitance of a section')

    def subcircuit(self):
        mid = self.node("mid")                                 # internal node "L1.mid"
        self.add("R1", Resistor(self.inp, mid), R=self.R)
        self.add("R2", Resistor(mid, self.out), R=self.R)
        self.add("C1", Capacitor(self.out, self.gnd), C=self.C)
```

- Inner nodes and sub-models are recorded with dotted names: `setOutPuts("L1.mid", "L1.R1.I")`.
- `subcircuit()` runs again before every analysis, so parameters changed by `sweep()` are always current.
- A model may have both `subcircuit()` and `analog()` (its own equations are solved together with its sub-models).
- The circuit solves the flattened network, so a hierarchical model costs the same as writing the elements one by one.

`DiodeBridge(ac1, ac2, plus, minus)` is a ready-made example (four `Diode` sub-models):

![Hierarchical models](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/subcircuit_example.png)

![Diode bridge](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/diode_bridge_example.png)

### 2.5 Digital models and buses: `dsignal`

Digital models are written with `dsignal` (Verilog-like). A model that has a `digital()` method is
called at every accepted time point; assignments use `<<=` and are driven on the node through a
Thevenin output stage (logic levels `Voh`, `Vol`, resistance `Rout`, delay `Tpd`, ...), so digital blocks
connect directly to analog circuits.

```python
from pyams.lib import model, dsignal

class MyCounter(model):
    def __init__(self, clk, q):
        self.Clk = dsignal('in', clk)
        self.Q = dsignal('out', q, width=3)       # a 3-bit bus: nodes q[0], q[1], q[2] (bit 0 = LSB)

    def digital(self):
        if self.Clk.rising:                       # also .falling / .changed
            self.Q <<= self.Q + 1                 # wraps at 8; <<= masks to the width
```

A bus supports integer operators, slices `ds[lo:hi]`, `.value`, and delayed assignment `ds.set(v, delay)`.
The digital models of section 5 are all written this way, and a model can have both `digital()` and `analog()`.

#### Logic levels: `Voh`, `Vol`, `Vil`, `Vih`

Every digital model carries the parameters of its logic family:

| Parameter | Default | Meaning |
|-----------|---------|---------|
| `Voh`, `Vol` | 5 V, 0 V | output levels for 1 and 0 (a Thevenin source behind `Rout`, with `Cout`) |
| `Vil`, `Vih` | 0.3, 0.7 | input thresholds, **as fractions of `Voh − Vol`**: below `Vlo = Vol + Vil·(Voh−Vol)` the input reads 0, above `Vhi = Vol + Vih·(Voh−Vol)` it reads 1, in between it keeps its previous value (hysteresis) |
| `Rout`, `Cout`, `Tpd` | 100 Ω, 10 pF, 10 ns | output resistance, output capacitance, propagation delay |

Choose them from the supply voltage and the family you want to model, e.g.
`g.setParams("Voh=3.3 Vol=0")` for 3.3 V logic or `"Voh=3.4 Vol=0.2 Vil=0.25 Vih=0.6"` for a TTL-like family.
Because the thresholds are fractions, changing `Voh` alone scales everything; two models of different families
connected together each read the other's output with their *own* thresholds. Under a heavy load the real output
level is lower than `Voh` (voltage drop on `Rout`).

**Example: astable multivibrator with one gate** (`digital_astable.py`). A `NOT` gate, a resistor from its output to its input and a
capacitor from the input to ground. Since the input keeps its value between `Vlo` and `Vhi`, the gate behaves as a Schmitt trigger and the circuit
oscillates, with the period

`T = (R+Rout)·C·[ ln((Voh−Vlo)/(Voh−Vhi)) + ln((Vhi−Vol)/(Vlo−Vol)) ] + 2·Tpd`

```python
g = NOT("x", "out");  g.setParams("Voh=5 Vol=0 Vil=0.3 Vih=0.7")
r = Resistor("out", "x"); r.setParams("R=10k")
c = Capacitor("x", "0");  c.setParams("C=10n")
```

| Family | `Vlo` / `Vhi` | T simulated | T theory |
|--------|--------------|-------------|----------|
| CMOS 5 V (0.3 / 0.7) | 1.50 / 3.50 V | 172.1 µs | 171.2 µs |
| 3.3 V logic (0.3 / 0.7) | 0.99 / 2.31 V | 172.1 µs | 171.2 µs |
| 5 V, wide hysteresis (0.2 / 0.8) | 1.00 / 4.00 V | 281.1 µs | 280.1 µs |
| TTL-like (`Voh=3.4 Vol=0.2`, 0.25 / 0.6) | 1.00 / 2.12 V | 152.8 µs | 151.9 µs |

Changing `Voh` alone (5 V → 3.3 V) does not change the period (the thresholds scale with it); changing `Vil`, `Vih` or `Vol` does.

![Digital astable](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/digital_astable.png)

| Counters | Sequential logic | ADC / DAC |
|:--:|:--:|:--:|
| ![Counters](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/digital_counter.png) | ![Sequential](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/digital_sequential.png) | ![ADC DAC](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/digital_adc_dac.png) |

---

## 3. Analysis

The analysis is chosen with `cir.analysis(mode=...)` and executed with `cir.run()`.

| `mode`   | Use it for                         | Main arguments                                  |
|----------|------------------------------------|-------------------------------------------------|
| `"dc"`   | operating point                    | –                                               |
| `"dc"` + `param=` | DC sweep (I–V curves, transfer curves) | `param`, `start`, `stop`, `step`        |
| `"tran"` | behaviour in time                  | `start`, `stop`, `step` (seconds)               |
| `"ac"`   | small-signal frequency response    | `start`, `stop` (Hz), `step` (points / decade)  |

### 3.1 DC operating point

```python
cir.analysis(mode="dc")
res = cir.run()
print(res["A"][0], res["D1.I"][0])
```

### 3.2 DC sweep

Sweep one parameter (`"Element.Parameter"`) and solve the operating point at every value:

```python
cir.analysis(mode="dc", param="V1.Vdc", start=0, stop=5, step=0.05)
res = cir.run()
# res["sweep"] -> swept values, res["D1.I"] -> diode current
cir.plot()
```

### 3.3 Transient analysis

```python
cir.analysis(mode="tran", start=0, stop=0.06, step=1e-4)
res = cir.run()           # {'time': ..., 'In': ..., 'Out': ...}
```

Options for demanding circuits (switching, stiff, oscillators):

| Option            | Effect                                                                      |
|-------------------|-----------------------------------------------------------------------------|
| `order=2`         | second-order (BDF2) integration; default `1` = backward Euler                |
| `adaptive=True`   | the solver chooses its own step (tiny at fast edges, large elsewhere); `step` then only sets the spacing of the output points |
| `lte`, `lte_abs`  | relative / absolute local-error tolerance of the adaptive step               |
| `max_step`        | largest internal step                                                        |
| `reltol`          | Newton convergence tolerance (default `1e-6`)                                |
| `uic=True`        | start from an all-zero state instead of the DC operating point               |
| `progress=True`   | show a progress bar on the console (or pass a function `fn(fraction, t)` for a GUI; raise in it to abort) |

```python
cir.analysis(mode="tran", start=0, stop=0.006, step=1e-6, adaptive=True, order=2)
```

### 3.4 AC (small-signal) analysis

PyAMS solves the DC operating point, linearises every element around it, and solves
the complex system at each frequency. The stimulus comes from the sources that define
an AC value (`ACVoltage`, `ACCurrent`). With a 1 V stimulus, the node phasor *is* the transfer function.

```python
import numpy as np
from pyams.lib import circuit
from pyams.models import ACVoltage, Resistor, Capacitor

V1 = ACVoltage("In", "0")
R1 = Resistor("In", "Out");  R1.setParams("R=1KΩ")
C1 = Capacitor("Out", "0");  C1.setParams("C=1uF")

cir = circuit()
cir.addElements({"V1": V1, "R1": R1, "C1": C1})
cir.setOutPuts("Out")
cir.analysis(mode="ac", start=1, stop=1e5, step=20)    # 20 points per decade
res = cir.run()

f, H = res["freq"], res["Out"]                          # H is complex
gain_db  = 20 * np.log10(np.abs(H))
phase_deg = np.angle(H, deg=True)
fc = f[np.argmin(np.abs(gain_db + 3.01))]               # -3 dB corner: ~159 Hz
cir.plot()                                              # Bode magnitude + phase
```

`scale="dec"` (default) / `"oct"` give `step` points per decade / octave;
`scale="lin"` gives `step` points in total.

### 3.5 Parametric sweep

`cir.sweep(param, list)` repeats the *whole* analysis (transient, DC or AC) for each value
of a parameter. `run()` then returns a list of result dictionaries (each with the extra
key `"param"`), and `plot()` overlays them.

```python
cir.analysis(mode="ac", start=1, stop=1e5, step=20)
cir.sweep(param="R1.R", list=[100, 1000, 10000])
runs = cir.run()                  # one result per resistor value
cir.plot()

cir.sweep()                       # switch the parametric sweep off
```

---

## 4. Showing the results

### Built-in plot

```python
cir.plot()                                   # show a window
cir.plot("result.png", show=False)           # save to a file
```

`plot()` adapts to the analysis: a transient run gives one panel per unit
(voltages, currents) against time, a DC sweep is plotted against the swept parameter,
an AC run gives magnitude and phase against frequency, and a parametric sweep overlays all runs.

| Transient (series RLC, `rlc.py`) | AC (series RLC band-pass, `ac_analysis.py`) |
|:--:|:--:|
| ![Transient](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/rlc_result.png) | ![AC](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/ac_rlc.png) |

### Your own plots and post-processing

`run()` returns plain NumPy arrays in a dictionary, so you can compute anything with them:

```python
import matplotlib.pyplot as plt

res = cir.run()
t, vout = res["time"], res["Out"]

print("peak output: %.3f V" % vout.max())
print("average    : %.3f V" % vout.mean())

fig, ax = plt.subplots()
ax.plot(t * 1e3, vout, label="Out")
ax.set_xlabel("Time (ms)")
ax.set_ylabel("Voltage (V)")
ax.legend()
fig.savefig("out.png", dpi=150)
```

| Analysis        | Keys of the result dictionary                                           |
|-----------------|-------------------------------------------------------------------------|
| `tran`          | `"time"`, then one array per output                                     |
| `dc` (point)    | `"time"` (one value), then one value per output                         |
| `dc` + `param`  | `"sweep"`, `"Element.Parameter"`, then one array per output             |
| `ac`            | `"freq"`, then one **complex** array per output                         |
| with `sweep()`  | a list of the dictionaries above, each with the extra key `"param"`     |

### Logic waveform viewer: `plot_wave`

`pyams.wave.plot_wave` draws a VHDL-style wave window: single bits as step traces, buses as
hexagons with their value (hex / bin / dec) and analog traces in the same window.

```python
from pyams.wave import plot_wave

plot_wave(res, [
    "clk",                                       # a bit
    ("count", ["s0", "s1", "s2"]),               # a bus, LSB first, hex
    ("count", ["s0", "s1", "s2"], "dec"),        # 'hex' | 'bin' | 'dec'
    ("Vin, Vdac", ["vin", "vdac"], "analog"),    # one or more analog traces
], vth=2.5, tscale=1e6, tunit="µs", tlim=(60, 100), filename="wave.png", show=True)
```

`vth` is the logic threshold (or a `(vl, vh)` pair: a bus with a bit in between shows `X`),
`tlim` zooms on a time window, `show=True` opens a window and `filename` saves a png.

| Bits, buses and analog (`wave_example.py`) | Tracking ADC: comparator + up/down counter + DAC (`tracking_adc.py`) |
|:--:|:--:|
| ![wave](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/wave_example.png) | ![tracking ADC](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/tracking_adc.png) |

---

## 5. Built-in models

```python
from pyams.models import Resistor, Capacitor, Diode, BJT   # ... see the list below
```

| Group | Models |
|-------|--------|
| Passive | `Resistor`, `Conductor`, `Capacitor`, `CapacitorIc`, `Inductor`, `InductorIc`, `NonlinearResistance`, `Transformer`, `TransmissionLine` |
| Switches | `Switch`, `SwitchV`, `IdealSwitch`, `Relay` |
| Laplace blocks | `LaplaceND`, `LaplaceZP` (and the `II`, `IV`, `VI` versions with voltage / current ports) |
| Independent sources | `DCVoltage`, `SinVoltage`, `ACVoltage`, `ExpVoltage`, `PWLVoltage`, `TrapezoidVoltage`, `DCCurrent`, `SinCurrent`, `ACCurrent`, `ExpCurrent`, `PWLCurrent`, `TrapezoidCurrent` |
| Controlled sources | `VCVS`, `VCCS`, `CCVS`, `CCCS` |
| Diodes / switching | `Diode`, `DiodeBridge`, `ZenerDiode`, `TunnelDiode`, `Diac`, `Thyristor`, `UJT` |
| Transistors | `BJT`, `MOSFET`, `MOSFET4`, `JFET`, `IGBT` |
| Analog ICs | `OpAmp`, `Comparator`, `Timer555` |
| Digital: gates and clock | `DigitalClock`, `NOT`, `AND`, `OR`, `NAND`, `NOR`, `XOR`, `XNOR` |
| Digital: sequential | `SRLatch`, `DLatch`, `DFF`, `JKFF`, `TFF`, `Register`, `ShiftRegister`, `Counter`, `LFSR` |
| Digital: combinational | `Multiplexer`, `Demultiplexer`, `Decoder`, `PriorityEncoder`, `MagnitudeComparator`, `ParityGenerator`, `BinaryToGray`, `GrayToBinary`, `SevenSegmentDecoder`, `Adder` |
| Mixed-signal | `DAC`, `ADC` |

Each class documents its terminals, signals and parameters in its docstring:

```python
help(BJT)
print(BJT("c", "b", "e").getParams())
```

### Switches and relay

```python
from pyams.models import Switch, SwitchV, Relay

sw = Switch("vs", "a", "vc", "0");  sw.setParams("Vt=0.5 Vw=1m Ron=1m Roff=1G")   # closed when V(vc) > Vt (smooth Ron/Roff)
sv = SwitchV("vs", "a", "vc", "0"); sv.setParams("Vt=0.5 Vw=1m")                 # a 0 V source when closed, removed when open
K = Relay("cp", "0", "vs", "no", "nc")                                           # coil, common, normally open / closed contacts
K.setParams("Rc=70 Lc=0.1 Ion=0.05 Ioff=0.01 Ton=5m Toff=3m")
```

`Relay` has a coil model `V = Rc·I + Lc·dI/dt`, hysteresis (`Ion` / `Ioff`) and contact delays (`Ton` / `Toff`).

| Switch charging / discharging a capacitor | `Switch` | `SwitchV` | `Relay` |
|:--:|:--:|:--:|:--:|
| ![charge discharge](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/switch_charge_discharge.png) | ![Switch](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/switch_example.png) | ![SwitchV](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/switch_v_example.png) | ![Relay](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/relay_example.png) |

### Laplace blocks

Transfer functions in the s domain, usable in AC, DC and transient analysis:

```python
H = LaplaceND("in", "0", "out", "0", num=[1, 0, 0], den=[1, 2*3.14159e3, (2*3.14159e3)**2])   # s² / (...)
Z = LaplaceZP("in", "0", "out", "0", zeros=[...], poles=[...], gain=1.0)                      # zeros / poles form
```

| Laplace blocks (`laplace_examples.py`) | Elliptic filter (`elliptic_filter.py`) |
|:--:|:--:|
| ![Laplace](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/laplace_examples.png) | ![Elliptic](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/elliptic_filter.png) |

### Digital blocks

Combinational blocks, arithmetic, registers and an LFSR, all with `dsignal` buses
(`digital_combinational.py`):

```python
MX = Multiplexer(["t0", "t1", "t2", "t3"], ["t4", "t5"], "mx")     # 4:1, data inputs, select bits, output
AD = Adder(["a0", "a1", "a2", "a3"], ["b0", "b1", "b2", "b3"], ["s0", "s1", "s2", "s3"], cout="co")
RG = Register(["d0", "d1", "d2", "d3"], "clk", ["q0", "q1", "q2", "q3"])
```

![Digital combinational blocks](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/digital_combinational.png)

---

## 6. More examples

The `examples/` folder contains ready-to-run scripts, each saving a figure:

| Script | What it shows |
|--------|---------------|
| `bridge_rectifier.py`, `zener_regulator.py` | rectification and regulation |
| `rlc.py`, `charge_discharge.py` | transient response of RC / RLC circuits |
| `ac_analysis.py`, `elliptic_filter.py` | AC analysis: RLC band-pass, common-emitter amplifier, op-amp, filters |
| `jfet_curves.py`, `thyristor_iv.py`, `ujt_oscillator.py` | DC sweeps and device characteristics |
| `bjt_astable.py`, `timer555_astable.py`, `ring_oscillator.py` | oscillators and multivibrators |
| `schmitt_opamp.py`, `comparator_demo.py` | comparators and Schmitt triggers |
| `chua_opamp.py`, `van_der_pol.py` | non-linear oscillators / chaos |
| `switch_example.py`, `switch_v_example.py`, `switch_charge_discharge.py`, `relay_example.py` | switches and relay |
| `laplace_examples.py`, `laplace_pulse_int_diff.py` | Laplace transfer-function blocks |
| `digital_counter.py`, `digital_sequential.py`, `digital_adc_dac.py`, `digital_combinational.py` | digital models with `dsignal` buses and DAC / ADC |
| `digital_astable.py` | one-gate astable: effect of `Voh`, `Vol`, `Vil`, `Vih` on the period |
| `subcircuit_example.py`, `diode_bridge_example.py` | hierarchical models (`subcircuit()`) |
| `wave_example.py`, `tracking_adc.py` | logic waveform viewer and a closed analog / digital loop (tracking ADC) |
| `transmission_line.py`, `thyristor_lamp_dimmer.py`, `igbt_chopper.py` | power and transmission-line circuits |

| 555 astable | JFET output curves | Chua double scroll |
|:--:|:--:|:--:|
| ![555](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/timer555_astable.png) | ![JFET](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/jfet_curves.png) | ![Chua](https://raw.githubusercontent.com/d-fathi/PyAMS/refs/heads/main/src/pypi-package/docs/images/chua_double_scroll.png) |

---

## License

`pyams_lib` is free to use and distributed under the **MIT** license.
