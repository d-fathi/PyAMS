# Features

## Modeling

* Write a new element in a few lines: declare signals and parameters, then write the equations in `analog()`.
* Time derivative `ddt(x)` and integral `idt(x)` are available inside the equations.
* No derivatives to code: the Jacobian is obtained automatically by finite differences of `analog()`.
* Parameters carry units and descriptions and accept engineering prefixes (`"C=100nF"`).
* About 40 built-in models: passive elements, controlled and independent sources, diodes, thyristors, BJT, MOSFET, JFET, IGBT, op-amp, comparator and 555 timer.

## Simulation

* DC operating point and DC sweep of any parameter.
* Transient analysis: backward Euler or second-order BDF, fixed or adaptive time step.
* Small-signal AC analysis with complex results (Bode plots).
* Parametric sweep that repeats any analysis for a list of values.
* Robust convergence: limited Newton steps, time-step bisection and gmin stepping.

## Results

* Results are NumPy arrays, ready for any post-processing.
* `plot()` draws transient, DC-sweep, AC and swept results with Matplotlib, and can save to a file.

## CAD system

Besides the Python library, PyAMS is available as a **CAD system** for designing and simulating circuits graphically. It comes in two forms:

| | PyAMS application | PyAMS extension for VS Code |
| :--- | :--- | :--- |
| **What it is** | A standalone desktop application, downloaded from https://pyams.sf.net | An extension installed inside Visual Studio Code |
| **Role** | A dedicated environment to draw the schematic, design symbols, run the simulation and view the results | The same CAD tools inside the code editor, next to your Python files and models |

In both forms the CAD system:

* **Captures the schematic** of the circuit (schematic capture);
* **Designs symbols** for the elements, including your own models;
* **Runs the simulation** (DC, transient and AC) with the `pyams` library;
* **Shows the results** in an interactive waveform viewer based on Plotly.

The `pyams` library is already included in the application and in the extension, so it is not installed with pip: only Python with `numpy` and `matplotlib` is needed (see [installation](installation)).

## General

* Pure Python 3, working on Linux, Windows and macOS (CPython and PyPy).
* Only two dependencies: NumPy and Matplotlib.
* Free software under the MIT license.