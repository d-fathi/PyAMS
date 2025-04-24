

The steps of simulation 
=======================

The simulation of circuits in PyAMS-CAD is based by Graphical user interface in six steps:

:red:`Step a. Add Symbol in schematic`

.. figure:: ../images/pyams_02.png

* 1. Select Library
* 2. Click the symbol in the components list;
* 3. Click the position in the schematic;
* 4. Rotation

:red:`Step b. Linking elements by wire`

.. figure:: ../images/pyams_03.png

* 1. Click on the wire icon;
* 2. Connect the pins;
* 3. Modified name or color of wire;

.. figure:: ../images/pyams_04.png

.. note::

 You can finish drawing the wires by “end Menu".

:red:`Step c. Modifying parameters of elements`

.. figure:: ../images/pyams_06.png

* 1. Click on parameter
* 2. Change value or name

.. figure:: ../images/pyams_07.png

*  You can add new parameter or reference or label.

.. figure:: ../images/pyams_05.png

*  You can change global parameters from dialog.

.. figure:: ../images/pyams_08.png

.. note::
  These parameters in the dialog are automatically exported 
  from the Python model in the initial function.

.. figure:: ../images/pyams_09.png

.. note::
   You can modified model described by python language.

:red:`Step d. Adding a analysis in the circuit with adjusting type of analysis and add outputs`

.. figure:: ../images/pyams_10.png

* 1. Click on the analysis icon
* 2. Select Analysis
* 3. Select the type
* 4. Add outputs

:red:`Step e. run circuit`

.. figure:: ../images/pyams_11.png

* 1. Click on the analysis command icon.
* 2. Click Execute in the dialog box.
* 3. Exit.

:red:`Step f. results`

.. figure:: ../images/pyams_12.png

* The result present in plot.

.. figure:: ../images/pyams_13.png

* By show plot you can get values (X,Y).


Operating-Points
================

The OP analysis by PyAMS is find operating points in the circuit 
for time=0.
The simulation of circuits in OP is based by tree steps:
* 1. Add Probe
* 2. Get Name 
* 3. Run OP analysis

:red:`1. Add Probe`

.. figure:: ../images/pyams_14.png

:red:`2. Get Name`

.. figure:: ../images/pyams_15.png

:red:`3. Run OP analysis`

.. figure:: ../images/pyams_16.png

