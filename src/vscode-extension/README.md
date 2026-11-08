# Welcome to the PyAMS documentation

[![PyPI version](https://img.shields.io/pypi/v/pyams-lib.svg)](https://pypi.org/project/pyams-lib/)
[![Supported Python versions](https://img.shields.io/pypi/pyversions/pyams-lib.svg)](https://pypi.org/project/pyams-lib/)
[![License](https://img.shields.io/github/license/d-fathi/pyams_lib.svg)](https://github.com/d-fathi/pyams_lib/blob/main/LICENSE)

## What is PyAMS?

**PyAMS** (*Python for Analog and Mixed Signals*) is a Python library for modeling and simulating analog and mixed-signal electronic circuits. It provides:

- The ability to create **custom models** of electronic components.
- **Simulation** of circuits in different modes of operation: DC, transient (TR) and AC.
- **Visualization** of the results with `matplotlib` in Python, or with `Plotly` in the CAD system.
- Compatibility with **Python 3+ and PyPy**, on Linux, Windows and macOS.
- **Circuit design** (schematic capture, symbol design and simulation) in a CAD environment, using either:
  1. **VS Code**, with the *PyAMS extension*.
  2. The **PyAMS software**: [pyams.sf.net](https://pyams.sf.net)


## What’s New 

**v0.3.1 (Current)** 

1. Updated PyAMS extension for VS Code.
1. Updated **PyAMS software** ([pyams.sf.net](https://pyams.sf.net)).
2. Updated **PyAMS library**.
3. Updated **PyAMS models**.
4. **Documentation Enhancements:** Updated the official documentation ([Read the Docs](https://pyams-lib.readthedocs.io/en/latest/)).

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


## Key Features
- **Graphical Schematic Designer:** Intuitive interface for drawing and designing circuit schematics.
- **Advanced Simulation Engine:** Powered by **pyams.lib** for accurate analog and mixed-signal circuit simulations (DC, AC, Transient).
- **Interactive Waveform Viewer:** Visualize and analyze simulation results with an interactive graph viewer, featuring PNG export capabilities.
- **Extensive Component Library:** Includes a wide range of **pyams.models**  (BJT, MOSFET, JFET, Diodes, OP-AMPs, and more).
- **Cross-Platform:** Built with ElectronJS, offering a seamless experience on Windows and Linux.

## Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PyAMS"
4. Click Install

## Usage
1. Open PyAMS from the Activity Bar
2. Create a new schematic
3. Add components from the library
4. Run simulation and view waveform results

## Requirements
- VS Code 1.70.0 or higher

## Document
- https://pyams-lib.readthedocs.io

## License
MIT License - See LICENSE file for details

## Support
For issues and feature requests, please visit: https://github.com/d-fathi/PyAMS/issues