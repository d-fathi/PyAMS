# Changelog

All notable changes to PyAMS will be documented in this file.

## [0.5.0] - Unreleased

### Added
- Symbols `Relay SPST` and `Relay SPDT` in the Basic library, bound to the `Relay` model (`pyams/models/Relay.py`): coil (`cp`, `cn`), common (`com`), normally open (`no`) and, for the changeover type, normally closed (`nc`) contacts. Drawn with the editor's own elements (looped coil, case, wires) and a Live widget for the contacts: the Automatic transfer switch (SPDT) and the Automatic switch (SPST), both with the dashed actuator arrow, bound to `param:act`. In the Live simulation the blade follows the armature.
- `Relay` model: parameter `act` and a `live()` hook that writes the armature position to it (1 = energised), for the widgets of the symbols. It does not change any other analysis.

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
