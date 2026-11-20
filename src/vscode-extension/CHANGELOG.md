# Changelog

All notable changes to PyAMS will be documented in this file.

## [0.6.0] - Unreleased

### Added
- Models `DAC_analog` and `ADC_analog` (`pyams/models/DAC_analog.py`, `ADC_analog.py`; the clocked digital `DAC` and `ADC` are unchanged) with node-list terminals: `DAC_analog(["D0", ..., "D7"], "aout")` and `ADC_analog("ain", ["D0", ..., "D7"])`; the number of bits is the length of the list (D0 = LSB). DAC: `Vout = Vref * code / 2^N` through `Ro`, a node is a 1 above `Vth` (smooth transition `Vw`), the inputs draw no current. ADC: ideal continuous-time converter, `code = floor(Vin / Vref * 2^N)` limited to 0 ... 2^N - 1, every output driven to `Voh` / `Vol` through `Ro` (smooth transition `Vw` in LSB). Symbols `DAC` and `ADC` in the new `Mixed-Signal` library: a body with an analog pin and a thick bus pin `D[0:7]`, and a `Vref` parameter text.
- Demo circuit `8-bit ADC and DAC with a Bus` (`demo`): a 1 kHz sine wave (2.5 V +/- 2.4 V) goes through an 8-bit ADC, the bus `D[0:7]` and an 8-bit DAC. Time-domain analysis 0 to 2 ms plots `vin`, `aout` and the MSB `D7`: the output is the staircase of the input (1 LSB = 19.5 mV, `vin - aout` between 1.4 mV and 18.6 mV). Carries a detailed HTML code note.
- Buses, phase 3 (netlist): a pin named `D[0:7]` connected to a wire named `D[0:7]` is written in the generated code as the list of its nodes, in the order of the name, e.g. `S = DAC(["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"], "aout")` (`D[7:0]` gives `D7` ... `D0`). A bus pin that is not connected gets a list of `"0"`. A pin whose width differs from its wire keeps the wire name as a string (the width check marks it). Other pins and wires, and the `pins` of the net list used by the Live simulation, are unchanged: the generated code of the 27 demos is identical. `busNodeNames`, `netListPinsBus` (`codePy.js`).
- Buses, phase 2 (width check): a pin connected to a wire of a different width (a bus pin `D[0:3]` on a normal wire, a normal pin on a bus, `D[0:3]` on `D[0:7]`) shows the green square of an unconnected pin in the schematic (the pin stays connected in the netlist) (tooltip: part, pin, widths) and listed in `drawing.busErrors`. Pins of standard parts (GND, ports) are not checked. `busCheck` (`cnode.js`), run after every connectivity update. The simulation is not blocked yet.
- Buses, phase 1 (drawing only): a wire whose Reference is written `D[0:7]` in the Properties panel is a bus of 8 lines (`D0` to `D7`; `D[7:0]` is accepted too, any name and any width of 2 or more). It is drawn thick (3 px) with larger junction dots. A pin named `D[0:7]` in the symbol editor is a thick bus pin (attribute `bus`). Renaming it back to a normal name restores the normal drawing. `busParse`, `netBusUpdate` (`cnode.js`) and `pinBusStyle` (`pin.js`). Width checks between wires and pins and the expansion into `D0` to `D7` in the netlist are not done yet: a bus is still simulated as one net.

### Fixed
- Junction dots follow the z-order of the drawing: when a wire passes over or under an element, the dot of that wire appears and disappears with the wire. A dot is hidden when a filled shape drawn above its wire covers it (`updateNodesVisibility` in `cnode.js`, run after every `nodes()`), and it is updated again when the order of the elements is changed (front / back / forward / backward, from the keyboard or from the list of elements: `reorderListElement` in `listElements.js`). Unfilled shapes, texts and open polylines never hide a dot, and a dot on the border of a shape stays visible.

## [0.5.0] - 2026-11-19

### Added
- Symbol `Tunnel Diode` in the Semiconductor library (the `TunnelDiode` model): the diode triangle with the bracket-shaped tunnel-diode cathode bar and an `Ip` parameter text.
- Demo circuit `Tunnel Diode Oscillator` (`demo`): a tunnel diode biased in its negative-resistance region through Rl = 5 Ω and L = 1 µH from a 0.25 V supply (`TrapezoidVoltage`, 1 ns rise), with C = 100 pF in parallel. Time-domain analysis 0 to 2 µs (options `uic`, `adaptive`, `order 2`) plots the diode voltage `D` and the node `X`: oscillation at 12.2 MHz with the diode voltage between 0 V and 0.54 V. Carries a detailed HTML code note (I(V) numbers, start-up condition, results, things to try).
- Demo circuit `Tunnel Diode Oscillator (Bias Network)` (`demo`): the classical textbook circuit with a bias circuit (1.5 V battery, closed `SwitchSPST`, R1 = 60 Ω, Rs = 12 Ω: V_th = 0.25 V, R_th = 10 Ω), the tunnel diode, the tank Cr = 100 pF / Lr = 1 µH (the inductor is turned with the editor's rotate command) and the load RL = 1 kΩ. Time-domain analysis 0 to 2 µs plots the load voltage `T` (oscillation at 12.2 MHz, centred on 0 V, -0.32 V to +0.24 V) and the bias node `A`. Carries a detailed HTML code note (DC and AC analysis, results, things to try).
- Symbol `Zener Diode` in the Semiconductor library (the `ZenerDiode` model): the diode of the `Diode` symbol with the bent Zener cathode bar and a `Vz` parameter text.
- Demo circuits `Zener Diode DC Sweep` (I-V characteristic: DC sweep of `V1.Vdc` from -10 V to 2 V through a 100 Ω resistor, plotted as `Z1.I` against the diode voltage) and `Zener Diode Clipper` (transient: a 15 V / 50 Hz sine wave limited to -0.73 V / +5.18 V by a 5.1 V Zener diode, which is also a shunt regulator). Both carry a detailed HTML code note.
- Demo circuit `Full-Wave Bridge Rectifier with Transformer` (`demo`): a 20 V / 50 Hz source with a series resistance feeds the `Transformer` model (L1 = 100 mH, L2 = 25 mH, 2:1 step-down); four `Diode` elements form the bridge, `C1` filters and `R1` loads it. A time-domain analysis plots both secondary terminals and the output (about 7.5 V with a 0.6 V ripple), and an HTML code note explains the circuit. A second version, `Full-Wave Bridge Rectifier with Transformer (Diode Bridge)`, replaces the four diodes by the `Diode Bridge` symbol (`DiodeBridge` model).
- Model `DiodeBridge` (`pyams/models/DiodeBridge.py`): full-wave diode bridge rectifier (`ac1`, `ac2`, `plus`, `minus`) built from four `Diode` sub-models with the new `subcircuit()` / `self.add()`. The parameters `Iss`, `Vt` and `n` are shared by the four diodes, and their currents can be recorded (`B1.D1.I`). Works in the transient analysis and in the Live simulation. Symbol `Diode Bridge` in the Semiconductor library: four diodes drawn like the `Diode` symbol, in a diamond (`ac1` left, `ac2` right, `plus` top, `minus` bottom).
- Live demo circuits `RC Charge Discharge SPDT` and `RC Charge Discharge SPST` (`demo/live`): an RC charge / discharge driven by a manual switch clicked during the Live simulation. The SPDT circuit charges `C1` to 10 V (switch up) and discharges it to 0 V (switch down); the SPST circuit charges `C1` through `R1` when closed (settling at 8.3 V because of the load `R2`) and discharges it through `R2` when open. Each carries a detailed explanation written with the HTML code element (components, time constants with formulas, expected values, how to run it).
- Symbols `Relay SPST` and `Relay SPDT` in the Basic library, bound to the `Relay` model (`pyams/models/Relay.py`): coil (`cp`, `cn`), common (`com`), normally open (`no`) and, for the changeover type, normally closed (`nc`) contacts. Drawn with the editor's own elements (looped coil, case, wires) and a Live widget for the contacts: the Automatic transfer switch (SPDT) and the Automatic switch (SPST), both with the dashed actuator arrow, bound to `param:act`. In the Live simulation the blade follows the armature.
- Symbols `Switch` and `SwitchV` in the Basic library, bound to the voltage-controlled switch models of the same names (`pyams/models/Switch.py`, `SwitchV.py`): terminals `p`, `n`, `cp`, `cn`. A control port (`cp`, `cn`) drives the contact; the Automatic switch widget shows whether it is closed (`param:act`).
- `Switch` and `SwitchV` models: parameter `act` and a `live()` hook that writes the state (1 = closed, `Vc` >= `Vt`) to it, for the widget of the symbols. It does not change any other analysis.
- Current-controlled switch: new model `SwitchI` (`pyams/models/SwitchI.py`, SPICE "W") and symbol `SwitchI` in the Basic library. Closed (`Ron`) when the control current `Ic` through its built-in ammeter (`cp` -> `cn`, in series with the controlling branch) is above `It`, open (`Roff`) otherwise, with a smooth transition of width `Iw`. Parameter `act` and a `live()` hook drive the Automatic switch of the symbol in the Live simulation.
- Manual switches: models `SwitchSPST` (`p`, `n`; parameter `state`) and `SwitchSPDT` (`com`, `no`, `nc`; parameter `pos`) in `pyams/models`, with the symbols `Switch SPST` and `Switch SPDT` in the Basic library. The position is a parameter of the part (closed / open with `Ron` / `Roff`); each symbol carries the SPST / SPDT switch widget bound to it, so the switch can be operated by a click while the Live simulation runs.
- SPST switch and SPDT switch widgets: new property `Line width` (0 = automatic, from the size of the widget), set next to the colors; the terminals grow with it. The SPDT switch also has `Throw spacing` (0 = automatic), the distance in pixels between its two output terminals. Symbols saved before keep their look.
- Automatic switch and Automatic transfer switch widgets: new property `Line width` (0 = automatic, from the size of the widget), set next to the colors; the contact rings grow with it. The Automatic transfer switch also has `Contact spacing` (0 = automatic), the distance in pixels between its two contacts, so the contacts can be placed on the grid points of the pins. Symbols saved before keep their look.
- `Relay` model: parameter `act` and a `live()` hook that writes the armature position to it (1 = energised), for the widgets of the symbols. It does not change any other analysis.

### Changed
- The wire tool stays active after a wire ends on a pin or on another wire (it used to stop while its button stayed highlighted, so the next click did not draw). Esc or the right mouse button leaves the tool. A wire started with the select tool by clicking on a pin still ends the tool after that wire.
- The junction dots take the colour of their wire, also when the colour of a net is changed in the properties panel (`nodesUpdateColor` in `cnode.js`).
- The junction dot of a wire that starts or ends on the side of another wire and first runs along it is now drawn where the branch really leaves the other wire: the overlapping part of the branch is cut off (`netTrimOverlap`). Pins and third wires at the old end are left alone; wires ending on the removed part stay connected to the other wire.
- Moving a part no longer lifts the far segment of a U-shaped wire (for example the bottom wire of a loop, with a ground symbol connected to it): only a Z-shaped wire, whose two end segments go the same way, has its middle segment centred again.
- Dragging a point of a wire can no longer leave a diagonal segment: before a wire is edited, duplicate and collinear points are removed (`netSimplifyForEdit`), so the segments strictly alternate horizontal / vertical. Wires drawn with diagonal segments are left untouched.
- Two wires that meet end to end are joined into one wire (collinear points are removed). Nothing is merged when a pin, a third wire or a T-junction is connected at that point, when the result would be a closed loop, or while a wire is being drawn. If one of the two wires carries a net name, that wire is kept.
- Ending a wire: **Esc** or the **right mouse button** finishes the wire being drawn. The last point (the one following the cursor) is kept, a zero-length wire is discarded, and the wire tool stays active. Pressing Esc or right-clicking again returns to the select tool; the browser context menu is not shown while the wire tool is active.
- Removed `setDirectionNetByTypePos0` from `net.js`: it was no longer used since a moved part re-routes its wires with `netRouteMovedEnd`.
- Moving a part no longer detaches the wires from the pins of the other parts: the end of a wire connected to the moved part follows it, the other end stays on its pin, and when the wire is no longer straight it is broken into segments that are all horizontal or vertical (a straight wire becomes a Z of four points with the middle segment halfway between the two pins; a wire that already has bends only moves its neighbouring point). Duplicate and collinear points are removed, so moving the part back restores the straight wire. Wires drawn with diagonal segments only move their end.
- Toolbar: the buttons of the four side panels (Properties, Symbols library, List of drawing elements, Live simulation) are grouped at the start of the toolbar. Only one of these panels is shown at a time: opening one closes the others, so they no longer pile up over the drawing. Shift / Ctrl + click keeps the other panels open; the buttons follow the panels, also when a panel is closed with its own close button. The `P` shortcut now toggles the Symbols library.

### Fixed
- Net (wire) editing in `net.js`: the points of a wire are snapped to the 5-unit grid with `Math.round` (negative coordinates were snapped the wrong way with `parseInt`), `netSamePositionPoint` no longer uses a global variable and also removes duplicate points inside a wire.
- Live simulation with digital models (`digital()` / `dsignal`: `Relay`, gates, flip-flops, counters ...): the digital part was not initialised or stepped by `pyams/live.py`, so a digital model never changed state. It now uses the same digital set-up as a normal run; older versions of `pyams` without digital models still work.
- A simulation could fail at start (`NameError: name 'object' is not defined`) when the opened folder contained a Python installation (e.g. a bundled PyPy): its standard-library folders were put on PYTHONPATH and shadowed modules such as `abc`. Python installations, standard-library copies and package internals are no longer added.
- A simulation could fail with `Cannot import PyAMS (Module use of python312.dll conflicts with this version of Python)` when the opened folder contained a copy of installed packages (numpy, scipy, `*.dist-info`, compiled `.pyd` / `.so` files): that folder was put on PYTHONPATH and shadowed the interpreter's own numpy. Folders holding third-party packages are no longer added.

## [0.4.0] - 2026-11-13

### Added
- Live simulation runs the circuit with Python: the Live panel starts `pyams/liveSession.py`; switches, buttons and sliders change model parameters while it runs, LEDs / 7-segments / polygon segments and scopes show the results (adjustable step and speed, Pause / Reset).
- Optional `def live(self)` in a model: called after every accepted step to write output parameters for the widgets.
- New live widgets: Gauge, Bar, Value display (outputs) and Rotary knob (input).
- New output widgets for relay circuits: Automatic switch (NO / NC contact) and Automatic transfer switch (changeover), driven by a bound parameter, signal or pin, with an optional dashed actuator arrow.
- Demo: `demo/live/` (LiveDemo, LiveSwitch, Relay and RelayNO models and symbols; Live Demo.dcs and Relay Circuit.dcs circuits).

## [0.3.1] - 2026-11-07

### Added
- Added new demo circuits: half-wave rectifier, common-emitter amplifier, inverting amplifier, DIAC Relaxation Oscillator, and RLC Band-Pass Filter.
- Added support for rendering math formulas in HTML notes using KaTeX (fully functional offline under webview CSP).
- Added project `.sym` files to the symbols panel list (appended after library models, named "Project" or "Project/sub...").
- Added automatic inclusion of project folders containing `.py` files to `PYTHONPATH` when running a circuit.

### Changed
- **Major Architecture Change:** All analyses now run exclusively through the native PyAMS engine.
- "PyAMS Circuit" across the user interface.
- Updated DC operating point analysis to use native PyAMS methods (`startPyAMSOp`/`stopPyAMSOp`), removing legacy `parseSpiceResults_` and `execOp` functions.
- Updated drawing area and grid colors to align with the new PyAMS logo.
- Improved the HTML editor and optimized HTML notes to display as thumbnails with Home zoom.
- Standardized time unit labels on schematics (e.g., "Sec", "sec", "seconds" are now uniformly displayed as "s").


### Fixed
- Fixed an issue where project models were not found when the project directory was located inside the extension folder.
- Fixed symbol linking in the "Select Model" dialog to correctly preserve the origin of chosen project models and generate accurate import statements (e.g., `from MyResistor import MyResistor`).
- Fixed a missing `break` statement in `OPCheck` within the properties dialog.


## [0.3.0] - 2026-10-30

### Added
- PyAMS extension for VS Code.

### Changed
- Updated **PyAMS software** ([pyams.sf.net](https://pyams.sf.net)).
- Updated **PyAMS library**.
- Updated **PyAMS models**.
- **Documentation Enhancements:** Updated the official documentation ([Read the Docs](https://pyams-lib.readthedocs.io/en/latest/)).
