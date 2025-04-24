.. include:: ../importCSS.txt

Simulation Options (future)
===========================

By option simulation, you can loosen the flow, potential, and relative tolerances that the simulator uses to determine whether a solution has converged,
using the aftol, aptol, and reltol settings respectively.
You can also increase the maximum number of iterations that the simulator uses to try to achieve convergence, using the itl setting.

Changing PyAMS Simulation Options
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In PyAMS softw., you can change the PyAMS options for simulation by clicking Simulation >> Option >> Simulation
from the main menu.

.. figure:: /images/option.png

A Listing of PyAMS Simulation Options
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:red:`1. aftol`

This loosens the absolute  flow tolerance. The default tolerance of 1e-8 to 1e-12 is not required for many designs,
particularly power circuits. Do not increase beyond 1e-6A.

:red:`2. aptol`

This loosens the absolute potential tolerance. The default tolerance of 1e-6V is not required for many designs,
particularly power circuits. Do not increase beyond 1e-3V.

:red:`3. reltol`

This loosens the relative flow and potential tolerances. Do not increase beyond 0.001.

:red:`4. error`

This is minimum error of convergence rate of Newton's Method. Do not increase beyond 0.001.

:red:`5. itl`

This is the maximum number of iterations the Newton-Raphson method takes during the calculation the DC operating point before non-convergence is declared. If the simulator cannot converge with 500 iterations,
increasing the number of iterations further is unlikely to help.

:red:`6. ntegration`

Integration Methods in Dynamic Analysis.

:red:`7. Interactive simulation`

Interval for interactive simulation (future).


Analysis Options
================

Changing analysis Options for simulation by clicking Simulation >> Option >> Analysis
from the main menu.

.. figure:: /images/option_analysis.png