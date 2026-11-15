# Changelog

All notable changes to PyAMS will be documented in this file.

## [0.5.0] - Unreleased

### Added
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
- Toolbar: the buttons of the four side panels (Properties, Symbols library, List of drawing elements, Live simulation) are grouped at the start of the toolbar. Only one of these panels is shown at a time: opening one closes the others, so they no longer pile up over the drawing. Shift / Ctrl + click keeps the other panels open; the buttons follow the panels, also when a panel is closed with its own close button. The `P` shortcut now toggles the Symbols library.

### Fixed
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
