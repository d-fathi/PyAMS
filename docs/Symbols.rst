.. _symbols-page:

Design symbols
==============

The analog elements in the circuit are designed by the symbol editor (Fig. 1) it presented PyAMS model (Fig. 2).
The graphical interface of the editor of symbols includes: 

* 1. drawing analog elements.
* 2. PyAMS description model.


.. figure:: /images/img_Screenshots_sym_a.png

   Fig. 1 symbol editor

.. figure:: /images/img_Screenshots_sym_b.png

   Fig. 2 PyAMS description model


In more detail, the creating of a symbol in the editor is based on the following steps: 

* 1. Drawing the electrical elements by lines, rectangles, ellipse, etc.; 
* 2. Adding ports; 
* 3. Adding references; 
* 4. Adding name of model; 
* 5. Adding parameters; 
* 6. Directory of saved.
* 7. Joining the symbol with a PyAMS model.


The steps of design symbol
^^^^^^^^^^^^^^^^^^^^^^^^^^^

 The creating of symbols in the editor is based on the following steps:

 *  **Step 1**	Open editor of symbol from PyAMS

 .. figure:: /images/sym_01.png

 *  **Step 2**  Draw the electrical elements by lines, rectangles, ellipse ....etc.

  .. figure:: /images/sym_02.png

 *  **Step 3**	Add ports or pins.

  .. figure:: /images/sym_03.png

 *  **Step 4**  Add parameters and edit name and value .

  .. figure:: /images/sym_04.png

 *  **Step 5**  Add reference and edit name.

  .. figure:: /images/sym_05.png

 *  **Step 6**  Save the new symbol to one of the folders in the models.
 
  .. figure:: /images/sym_06.png

  .. note::

   The name of model (which is automatically generated) is the same as the name of the symbol file.

  .. figure:: /images/sym_07.png

 *  **Step 7** Create a PyAMS model for resistance..
 
  .. figure:: /images/sym_08.png

 Or attach symbol with PyAMS model by placed or saved in the same directory with the same name of model (with extension *.py

 .. figure:: /images/sym_09.png

The modeling of analog elements in PyAMS is based on writing their description using the Python language respecting the following structure:

* 1. Declaration of the library;
* 2. Creation of the name of the model;
* 3. Adding parameters with an initial value;
* 4. Adding type of signals (current or voltage);
* 5. Adding sub-models if available;
* 6. Definition of relations between signals and parameters;

 .. note::

  The name of  model must have the same name as the Python file and the symbol file.

 .. figure:: /images/sym_10.png


 *  **Step 8**  You can add a description of symbol to help the designer (using the Help menu).

 .. figure:: /images/sym_11.png

 *  **Step 9**  You can organize your new symbol.

 .. figure:: /images/sym_12.png

 *  **Step 10**   By up down library  or symbols

 .. figure:: /images/sym_13.png

 *  **Step 11**  Update the library on the PyAMS software.

 .. figure:: /images/sym_14.png