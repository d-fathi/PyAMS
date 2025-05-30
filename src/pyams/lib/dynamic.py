#-------------------------------------------------------------------------------
# Name:        Dynamic Systems
# Author:      d.fathi
# Created:     13/04/2025
# Copyright:   (c) PyAMS 2025
# Licence:     free
# info:       module of derivative and integration appliction in dynamic systems
#-------------------------------------------------------------------------------


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

    def setIntegration(self, method, timeStep,op):
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
                signal.op=op
                signal.control = self

            # Set integration properties for parameters
            for param in element.getParams():
                param.integr = method
                param.timeStep = timeStep
                param.op=op
                param.control = self

    def opAnalysis(self):
        """
         Do not use dynamic calculation for all signals and parameters
         when using op analysis.
        """
        for name, element in self.circuit.elem.items():
            # Set integration properties for signals
            for signal in element.getSignals():
                signal.integr = 0
                signal.timeStep = 0
                signal.op=True
                signal.control = self

            # Set integration properties for parameters
            for param in element.getParams():
                signal.integr = 0
                signal.timeStep = 0
                signal.op=True
                signal.control = self

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



# Trapezoidal Differentiation Method
def ddt_trap(signal, initialValue=0.0)-> float:
    """
    Perform trapezoidal differentiation on a signal.
    Args:
        signal: The signal object to differentiate.
        initialValue (float or int): Initial value for differentiation.
    Returns:
        float: The differentiated value (dx).
    """
    try:
        # Update differentiation values
        signal.x1 = signal.value
        signal.dx = 2*((signal.x1-signal.x0)/signal.timeStep)-signal.dx0
        return signal.dx
    except AttributeError:
        # Initialize signal differentiation properties on the first call
        listSignalDdt=signal.control.listSignalDdt
        listSignalDdt.append(signal)

        # Set initial values
        signal.x0 = float(initialValue) if isinstance(initialValue, (int, float)) else initialValue.value
        signal.x1 = signal.value
        signal.dx0 = 0.0
        signal.dx = 0.0

        # Compute initial differentiation
        signal.dx = 2 * ((signal.x1 - signal.x0)/signal.timeStep) - signal.dx0
        signal.intg = 0  # Optional initialization for further extensions
        return signal.dx


# Trapezoidal Integration Method
def idt_trap(signal, initialValue=0.0)-> float:
    """
    Perform trapezoidal integration on a signal.
    Args:
        signal: The signal object to integrate.
        initialValue (float or int): Initial value for integration.
    Returns:
        float: The integrated value (x).
    """
    try:
        # Update integration values
        signal.f1 = signal.value
        signal.x = signal.x0 + 0.5 * timeStep * (signal.f1 + signal.f0)
        return signal.x
    except AttributeError:
        # Initialize signal integration properties on the first call
        global listSignalIdt
        listSignalIdt.append(signal)
        simulationOption.idt = len(listSignalIdt)

        # Set initial values
        signal.f0 = float(initialValue) if isinstance(initialValue, (int, float)) else initialValue.value
        signal.f1 = 0.0
        signal.x0 = 0.0
        signal.x = 0.0

        # Compute initial integration
        signal.x = signal.x0 + 0.5 * timeStep * (signal.f1 + signal.f0)
        signal.intg = 0  # Optional initialization for further extensions
        return signal.x




# Gear Differentiation Method
def ddt_gear(signal, initialValue=0.0)-> float:
    """
    Perform Gear differentiation on a signal.
    Args:
        signal: The signal object to differentiate.
        initialValue (float or int): Initial value for differentiation.
    Returns:
        float: The differentiated value (dx).
    """
    try:
        # Update differentiation value
        signal.x = signal.value
        signal.dx = 2 * (signal.x - signal.xs) / timeStep
        return signal.dx
    except AttributeError:
        # Initialize signal properties for Gear differentiation
        global listSignalDdt
        listSignalDdt.append(signal)
        simulationOption.ldt = len(listSignalDdt)

        # Set initial values
        signal.x0 = float(initialValue) if isinstance(initialValue, (int, float)) else initialValue.value
        signal.x = signal.x1 = signal.x2 = signal.x3 = 0.0
        signal.xs = (48 * signal.x0) / 25
        signal.dx = 2 * (signal.x - signal.xs) / timeStep
        signal.intg = 1  # Mark as using Gear integration
        return signal.dx


# Gear Integration Method
def idt_gear(signal, initialValue=0.0)-> float:
    """
    Perform Gear integration on a signal.

    Args:
        signal: The signal object to integrate.
        initialValue (float or int): Initial value for integration.

    Returns:
        float: The integrated value (x).
    """
    try:
        # Update integration value
        signal.x = signal.xs + timeStep * 12 * signal.value / 25
        return signal.x
    except AttributeError:
        # Initialize signal properties for Gear integration
        global listSignalIdt
        listSignalIdt.append(signal)
        simulationOption.idt = len(listSignalIdt)

        # Set initial values
        signal.x0 = float(initialValue) if isinstance(initialValue, (int, float)) else initialValue.value
        signal.x = signal.x1 = signal.x2 = signal.x3 = 0.0
        signal.xs = (48 * signal.x0) / 25
        signal.x = signal.xs + timeStep * 12 * signal.value / 25
        signal.intg = 1  # Mark as using Gear integration
        return signal.x


# Differentiation Method by otpion in circuit
def ddt(signal,initialValue=0.0)->float:
   if signal.op:
     return 0.0;
   if signal.integr==0:
     return ddt_trap(signal,initialValue);
   return ddt_gear(signal,initialValue);

# Integration Method by option in circuit
def idt(signal,initialValue=0.0)->float:
   if signal.integr==1:
     return idt_trap(signal,initialValue);
   return idt_gear(signal,initialValue);
