# Changelog

All notable changes to PyAMS will be documented in this file.

## [Unreleased]

### Added
- Live simulation runs the circuit with Python: the Live panel starts `pyams/liveSession.py`; switches, buttons and sliders change model parameters while it runs, LEDs / 7-segments / polygon segments and scopes show the results (adjustable step and speed, Pause / Reset).
- Optional `def live(self)` in a model: called after every accepted step to write output parameters for the widgets.
- New live widgets: Gauge, Bar, Value display (outputs) and Rotary knob (input).
- Demo: `demo/live/` (LiveDemo.py model, LiveDemo.sym symbol, Live Demo.dcs circuit).

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
