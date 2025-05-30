#-------------------------------------------------------------------------------
# Name:        simulation options
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

        #for mixed signals (Analog to Digital)
        self.Vih=3.5            # Logic High for Minimum Input Voltage
        self.Vil=0.5            # Logic Low for Maximum Input Voltage
        #for mixed signals (Digital to Analog)
        self.Voh=5              # Output Voltage for Logic High
        self.Vol=0              # Output Voltage for Logic Low

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
            elif key == 'Voh':
                self.Voh = float_(value)
            elif key == 'Vol':
                self.Vol = float_(value)
            elif key == 'Vih':
                self.Vih = float_(value)
            elif key == 'Vil':
                self.Vil = float_(value)



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





