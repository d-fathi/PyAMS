.. _modeling-page:

Modeling
========

The modeling of analog elements in `pyams.lib` is based on defining their behavior using the Python language while following a structured approach:

1. Declaring the required library;
2. Defining the model name;
3. Specifying parameters with initial values;
4. Defining signal types (current or voltage);
5. Adding sub-models if applicable;
6. Establishing relationships between signals and parameters.

The general structure for modeling an analog element in `pyams.lib` is illustrated in the following example:

.. code-block:: py3

   from pyams.lib import model, signal  # Library declaration

   class NameOfElement(model):          # Model definition

        def __init__(self, ports):      # Initialization function
                                        # Declare signals (analog or digital) and parameters

        def sub(self):                  # Sub-function
                                        # Define sub-circuit or sub-model

        def start(self):                # Start function
                                        # Initialize values at the start of simulation
 
        def analog(self):               # Analog function
                                        # Define equations or analog operations

        def digital(self):              # Digital function
                                        # Define digital operations




Initial and Analog Functions
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The initialization function (``def __init__``) is used to create ports for connections, define signals (analog or digital), 
and set default values for variables and parameters. The analog function (``def analog``) or digital function (``def digital``) is responsible for defining the mathematical relationships between signals and parameters, representing the behavioral model of  analog or digital elements .

The ``__init__`` , ``analog`` or  ``digital``functions are the core components of a model. Additionally, there are two optional functions:

- **Sub-function:** Used to construct sub-circuits within the model.
- **Start function:** Initializes values when starting a simulation.

Signals and Parameters in `pyams.lib`
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Signals in `pyams.lib` represent electrical quantities (voltage or current) and define how connections are established within the model. Signal declaration follows this syntax:

.. code-block:: py3

      signal([Direction, Type, Port_p, Port_n])

where:

- ``Direction`` specifies whether the signal is ``in`` or ``out``.
- ``Type`` defines the signal as either ``current`` or ``voltage``.
- ``Port_p`` and ``Port_n`` indicate the positive and negative terminals of the connection.

Parameters in an analog model are constants or variables that influence circuit behavior. They are declared as follows:

.. code-block:: py3

      param([Value, Unit, Description])

where:

- ``Value`` is the default parameter value.
- ``Unit`` specifies the measurement unit.
- ``Description`` provides a brief explanation of the parameter.

Allowed Operations Between Signals and Parameters
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The following table summarizes the mathematical and logical operations available in `pyams.lib`:

=========  ================================  =========
Operation  Description                       Result
=========  ================================  =========
`+`          Addition                          real
`-`          Subtraction                       real
`*`          multiplication                    real
`/`          division                          real
`**`         exponentiation                    real
`==`         test for equality                 boolean
`!=`         test for inequality               boolean
`<`          test for less than                boolean
`<=`         test for less than or equal       boolean
`>`          test for greater than             boolean
`>=`         test for greater than or equal    boolean
`+=`         get value                         real
=========  ================================  =========


