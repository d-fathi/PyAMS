# Changelog

All notable changes to PyAMS will be documented in this file.

## [0.1.6] - 2026-10-01
### Added
- **Message Dialog System:** Introduced a comprehensive message dialog system supporting error, warning, info, and success notifications for better user feedback.
- **OP Simulation Error Handling:** Added a dedicated error dialog specifically for Operating Point (OP) simulation failures to provide clearer troubleshooting information.

### Changed
- **Documentation Enhancements:** Updated simulation documentation, including increased image width for better visibility, and general documentation refinements.
- **Repository Metadata:** Updated README.md and clarified repository usage guidelines (e.g., source code usage).

## [0.1.5] - 2026-09-26
### Added
- <span style="color:red">**Simulation Analysis Scope:** OP (Operating Point) analysis is now fully functional and supported, while TR (Transient), DC, and AC analyses are postponed to upcoming releases.</span>
- **Description Pane Controls:** Added a dedicated button to toggle (show/hide) the circuit description pane.
- **Element Type Display:** Enhanced the description panel to dynamically show the currently selected element type.
- **Symbol Model Management:** Added an "add model" button specifically tailored for symbol (`.sym`) files.

### Changed
- **Comprehensive Theme Support:** Updated colors for Rectangle, Ellipse, Arc, Polygon, Polyline, Wire, and Pin shapes, along with toolbar button SVGs, to ensure seamless compatibility with all VS Code themes.
- **HTML Description Theming:** Added full VS Code theme support to the HTML circuit description view and refined symbol list styling.
- **Basic Symbol Refinement:** Updated the colors and naming conventions of basic symbols, including ports, V bar, and GND.

### Fixed
- **Properties Panel Descriptions:** Resolved display issues regarding page size, SPICE model names, and element values within the Properties panel description area.

## [0.1.4] - 2026-09-20
### Added
- **Circuit Simulation Engine:** Added `runSimulation` function to enable and execute circuit analysis.
- **Simulation Results Display:** Added a dedicated view to display circuit simulation results directly within the editor.
- **Analysis Graphs Enhancement:** Added X- and Y-axis output data visualization to analysis graphs for better data interpretation.
- **Component Selection Dialog:** Introduced `elementDialog` for streamlined component selection and placement.
- **Semiconductor Elements:** Added and updated various semiconductor elements to expand the built-in component library.
- **Output Management:** Added functionality to dynamically add and remove analysis outputs during simulation setup.
- **Interactive Properties Panel:** Updated analysis views to automatically show the Properties panel when double-clicking a circuit element.

### Changed
- **Code Refactoring:** Renamed internal parsing functions to match `parseSpiceResults` for better consistency and maintainability.
- **DOM Utility Update:** Updated the `getElementsByClassName` function for improved performance and reliability across the webview.

### Fixed
- **Reference Naming:** Resolved reference naming issues to ensure accurate component and net identification during simulation and editing.

## [0.1.3] - 2026-09-16
### Added
- **Package Metadata:** Added keywords to the extension package for better discoverability in the VS Code marketplace.

### Changed
- **Schematic Symbols:** Updated voltage and current source symbols, Vbar (Vcc), and basic circuit elements to use device names consistently.
- **GND Behavior:** Improved GND symbol updating logic based on its attachment position in the circuit.
- **Theming Support:** Updated Operating Point (OP) analysis and wire colors to ensure proper visibility and contrast across all VS Code themes.
- **Terminology:** Renamed "lib" references to "library" throughout the project for better clarity and consistency.

### Fixed
- **Wire Naming:** Resolved wire renaming issues, specifically for Input, Output, and Bidirectional ports.
- **Wire Rendering:** Fixed general wire naming and color display inconsistencies in the canvas.

## [0.1.2] - 2026-09-12
### Added
- **SPICE Netlist Editor:** Introduced a new dialog for editing SPICE netlist files with full syntax highlighting.
- **Enhanced Code Editor:** Added a dedicated dialog for editing HTML/CSS code files with syntax highlighting, VSCode Dark+ theme alignment, improved scrollbar handling, and active line highlighting.
- **Library Model Picker:** Enabled selecting SPICE models directly from bundled libraries, including support for nested directory scanning for `.lib` files.
- **Toolbar & Shortcuts:** Added a new "Model" toolbar button and a 'D' keyboard shortcut for quick SPICE model creation.
- **Clipboard Commands:** Added native support for Copy, Cut, and Paste operations within the editor.
- **Shape Tools:** Updated and refined toolbar buttons for arc, ellipse, polygon, rect, and polyline drawing.

### Changed
- **SPICE Model Handling:** Centralized and improved the application of SPICE model metadata to symbols and drawing elements. The properties panel now seamlessly displays device/model fields and supports a "Find similar model" action.
- **Symbol Storage:** Enhanced symbol handling to store data as JSON with robust device and model support.

### Fixed
- **Code Editor:** Resolved text misalignment issues during typing between the textarea and highlight layer.
- **Symbol Rendering:** Fixed various issues related to symbol references, device names, and null symbol handling.
- **Circuit Interaction:** Improved probe editing and positioning accuracy within the circuit canvas.

## [0.1.1] - 2026-09-08
### Added
- **Enhanced Custom Editors:** Native visual editing support for `.dcs` (Circuit Schematics) and `.sym` (Component Symbols) files directly within VS Code.
- **Interactive Drawing Canvas:** Introduced a full-featured graphical environment equipped with zoom, pan, grid snapping, and a dynamic context-aware toolbar.
- **Seamless IDE Integration:** Deep integration with VS Code's native features, including full support for Undo/Redo history and clipboard operations (Copy/Cut/Paste).
- **New Properties Panel:** Added an intuitive side panel for real-time component configuration and attribute editing.
- **New Symbols Panel:** Introduced a dedicated panel for quick browsing, management, and placement of electronic components.
- **Signal List Dialog:** Added a new dialog interface for better tracking and management of simulation signals.

### Fixed
- **Bug Fixes:** Revised and resolved multiple stability issues related to DC Analysis, schematic circuit rendering, and custom symbol design.