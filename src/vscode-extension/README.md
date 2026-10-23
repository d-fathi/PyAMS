# PyAMS: Designing and Simulating Analog and Digital Circuits

PyAMS (Python for Analog and Mixed Signals) is a professional, cross-platform circuit design and simulation environment built for VS Code. It provides a powerful graphical schematic designer and delivers precise waveform simulation results powered by the robust **ngspice** engine.

## What’s New 

**v0.1.6 (Current)**

### Added
- **Message Dialog System:** Introduced a comprehensive message dialog system supporting error, warning, info, and success notifications for better user feedback.
- **OP Simulation Error Handling:** Added a dedicated error dialog specifically for Operating Point (OP) simulation failures to provide clearer troubleshooting information.

### Changed
- **Documentation Enhancements:** Updated simulation documentation, including increased image width for better visibility, and general documentation refinements.
- **Repository Metadata:** Updated README.md and clarified repository usage guidelines (e.g., source code usage).

## Screenshots
<img src="https://github.com/GPyAMS/Docs/blob/main/docs/images/Ohm_law.gif?raw=true" alt="PyAMS VSCode Interface" width="800">


## Key Features
- **Graphical Schematic Designer:** Intuitive interface for drawing and designing circuit schematics.
- **Advanced Simulation Engine:** Powered by ngspice for accurate analog and mixed-signal circuit simulations (DC, AC, Transient).
- **Interactive Waveform Viewer:** Visualize and analyze simulation results with an interactive graph viewer, featuring PNG export capabilities.
- **Extensive Component Library:** Includes a wide range of SPICE models (BJT, MOSFET, JFET, Diodes, OP-AMPs, and more).
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
- https://pyams.readthedocs.io

## License
MIT License - See LICENSE file for details

## Support
For issues and feature requests, please visit: https://github.com/GPyAMS/PyAMS/issues