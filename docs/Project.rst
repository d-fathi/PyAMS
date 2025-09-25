Creating a Project in PyAMS
===========================

A *project* in **PyAMS** is a schematic of an electronic circuit together with
its models and the analysis settings required to simulate it.

Steps to Create a New Project
-----------------------------

1. Create a New File
   ^^^^^^^^^^^^^^^^^
   - Open **PyAMS** and choose :menuselection:`File --> New`.
   - Save the file into your Folder **Workspace/** where all project files will be stored
     (see :numref:`fig_new_project`).

2. Convert the File to a Project
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   - From the menu, select the **Project** file type (see :numref:`fig_type_project`).

3. Create Models (Components)
   ^^^^^^^^^^^^^^^^^^^^^^^^^^
   - A **models** folder is created automatically inside
     ``Workspace/models`` once you set the file type to *Project*.
   - You can modify or add new models and symbols using the **Symbol Editor**.
   - Returning to PyAMS, open your file project in **Workspace/**.  
     You will find your models available in the **Library Browser** under **Project [models]**.
   - From the **Library Browser**, drag and drop models onto the schematic
     (see :numref:`fig_place_models`).

4. Wire the Circuit
   ^^^^^^^^^^^^^^^^
   - Use the **Wire/Net** tool to connect component pins.
   - Add **Sources**, **Ground**, and **Probes** as required for measurements.

5. (Optional) Add a PyCode Block
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   - Insert a **PyCode** block to enable *simulation by analysis* with Python.
   - In the **PyCode** dialog:
     - The first page shows the generated circuit code (read-only).
     - The second page allows you to extend the analysis using Python,
       ``pyams-lib``, and any user-installed packages
       (see :numref:`fig_pycode_dialog`).

6. Set Up Analyses
   ^^^^^^^^^^^^^^^
   - Open **Analysis Settings** and choose the required analysis types:
     **DC**, **AC**, **Transient**, etc. (see :numref:`fig_analysis_setup`).
   - Define start/stop values, steps, initial conditions, and output variables.

7. Run the Simulation
   ^^^^^^^^^^^^^^^^^^
   - Click **Run** to execute the configured analyses (see :numref:`fig_run_sim`).
   - If a **PyCode** block is present, it will also execute any custom computations.

Figures
-------

.. _fig_new_project:

.. figure:: /images/project_new_project.png
   :alt: Create a new PyAMS file
   :align: center

   Figure 1 – Creating a new project in PyAMS.

.. _fig_type_project:

.. figure:: /images/project_type_project.png
   :alt: Convert file to project
   :align: center

   Figure 2 – Converting a file to a PyAMS project.

.. _fig_creat_symbol:

.. figure:: /images/project_creat_symbol.png
   :alt: desgine by symbol editor
   :align: center

   Figure 3 – creat symbol.

.. _fig_creat_model:

.. figure:: /images/project_creat_models.png
   :alt: creat model of the symbol
   :align: center

   Figure 4 – creat model.

.. _fig_save_models:

.. figure:: /images/project_save_model.png
   :alt: save models (symbol+python) into 
   :align: center

   Figure 5 – the models saved in ``Workspace/models``.  


.. _fig_place_models:

.. figure:: /images/project_place_models.png
   :alt: Place circuit models/components
   :align: center

   Figure 6 – Placing models from the library into the schematic.

.. _fig_pycode_dialog:

.. figure:: /images/project_pycode_dialog.png
   :alt: PyCode dialog with two pages
   :align: center

   Figure 7 – PyCode dialog: read-only circuit code (page 1) and Python analysis (page 2).

.. _fig_analysis_setup:

.. figure:: /images/project_analysis_setup.png
   :alt: Configure analysis types
   :align: center

   Figure 8 – Configuring DC/AC/Transient analyses.

.. _fig_run_sim:

.. figure:: /images/project_run_simulation.png
   :alt: Run simulation
   :align: center

   Figure 9 – Running the simulation.

.. _fig_results_view:

.. figure:: /images/project_results_view.png
   :alt: Results and plots
   :align: center

   Figure 10 – Viewing and exporting simulation results.
