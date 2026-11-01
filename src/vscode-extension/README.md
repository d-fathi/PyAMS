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
  2. The **PyAMS software**: https://pyams.sf.net


## What’s New 

**v0.3.0 (Current)** 

1. *PyAMS extension* tow **VS Code**.
2. Update **PyAMS software**.
3. Update pyams library.
4. update pyams models

### Added
- **Message Dialog System:** Introduced a comprehensive message dialog system supporting error, warning, info, and success notifications for better user feedback.
- **OP Simulation Error Handling:** Added a dedicated error dialog specifically for Operating Point (OP) simulation failures to provide clearer troubleshooting information.

### Changed
- **Documentation Enhancements:** Updated simulation documentation, including increased image width for better visibility, and general documentation refinements.
- **Repository Metadata:** Updated README.md and clarified repository usage guidelines (e.g., source code usage).



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