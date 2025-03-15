#-------------------------------------------------------------------------------
# Name:        Struct
# Author:      d.fathi
# Created:     20/03/2015
# Update:      12/01/2025
# Copyright:   (c) PyAMS 2025
# Web:         https://pyams.sf.net/
# Info:        option..
#-------------------------------------------------------------------------------


#-------------------------------------------------------------------------------
# class of simulation options
#-------------------------------------------------------------------------------


class option:
    """
    Represents simulation options for pyams.
    Includes tolerances, integration methods, and iteration limits.
    """

    def __init__(self,circuit):
        """
        Initialize default simulation options.
        """
        self.aftol = 1e-8       # Absolute flow tolerance
        self.aptol = 1e-6       # Absolute potential tolerance
        self.reltol = 1e-3      # Relative flow and potential tolerances
        self.error = 1e-8       # Error of convergence
        self.itl = 160          # Maximum number of iterations
        self.integration = 1    # Integration method (1: trapezoidal, 2: gear)
        self.interval = 100     # Interval for interactive simulation (milliseconds)
        self.circuit=circuit    # Circuit used

    def setOption(self, options: dict):
        """
        Update simulation options based on a provided dictionary.

        Args:
            options (dict): Dictionary containing option key-value pairs.
                Example: {'aftol': 1e-9, 'integration': 'gear'}

        Raises:
            ValueError: If invalid keys or values are provided.
        """
        from utils import float_

        # Validate and update options
        for key, value in options.items():
            if key == 'aftol':
                self.aftol = float_(value)
            elif key == 'aptol':
                self.aptol = float_(value)
            elif key == 'reltol':
                self.reltol = float_(value)
            elif key == 'error':
                self.error = float_(value)
            elif key == 'itl':
                self.itl = int(value)
            elif key == 'integration':
                if value.lower() == 'trapezoidal':
                    self.integration = 1
                elif value.lower() == 'gear':
                    self.integration = 2
            elif key == 'interval':
                self.interval = int(value)



    def __str__(self):
        """
        String representation of simulation options for debugging or logs.
        """
        return (f"Simulation Options:\n"
                f" - Absolute Flow Tolerance (aftol): {self.aftol}\n"
                f" - Absolute Potential Tolerance (aptol): {self.aptol}\n"
                f" - Relative Tolerance (reltol): {self.reltol}\n"
                f" - Error of Convergence: {self.error}\n"
                f" - Maximum Iterations (itl): {self.itl}\n"
                f" - Integration Method: {'trapezoidal' if self.integration == 1 else 'gear'}\n"
                f" - Interval (ms): {self.interval}\n")




class control:
    """
    Represents simulation controls for a circuit, including step time management
    and integration/differentiation updates.
    """

    def __init__(self, circuit):
        """
        Initialize the control class with a given circuit.
        Args:
            circuit: The circuit object to control.
        """
        self.circuit = circuit
        self.listSignalDdt = []  # List for signals involved in differentiation
        self.listSignalIdt = []  # List for signals involved in integration

    def setIntegration(self, method, timeStep):
        """
        Apply the integration method and time step to all signals and parameters.

        Args:
            method (int): Integration method (0 = Trapezoidal, 1 = Gear).
            timeStep (float): Time step size for integration.
        """
        for name, element in self.circuit.elem.items():
            # Set integration properties for signals
            for signal in element.getSignals():
                signal.integr = method
                signal.timeStep = timeStep
                signal.control = self

            # Set integration properties for parameters
            for param in element.getParams():
                param.integr = method
                param.timeStep = timeStep
                param.control = self

    def update(self):
        """
        Update state variables for all signals after each time step.
        Handles both Gear and Trapezoidal integration signals.
        """
        # Update differentiation signals
        for signal in self.listSignalDdt:
            if signal.intg == 0:  # Trapezoidal integration
                signal.dx0 = signal.dx
                signal.x0 = signal.x1
            elif signal.intg == 1:  # Gear integration
                signal.x3 = signal.x2
                signal.x2 = signal.x1
                signal.x1 = signal.x0
                signal.x0 = signal.x
                signal.xs = (48 * signal.x0 - 36 * signal.x1 + 16 * signal.x2 - 3 * signal.x3) / 25

        # Update integration signals
        for signal in self.listSignalIdt:
            if signal.intg == 0:  # Trapezoidal integration
                signal.x0 = signal.x
                signal.f0 = signal.f1
            elif signal.intg == 1:  # Gear integration
                signal.x3 = signal.x2
                signal.x2 = signal.x1
                signal.x1 = signal.x0
                signal.x0 = signal.x
                signal.xs = (48 * signal.x0 - 36 * signal.x1 + 16 * signal.x2 - 3 * signal.x3) / 25

