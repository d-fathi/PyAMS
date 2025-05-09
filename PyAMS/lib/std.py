#-------------------------------------------------------------------------------
# Name:        Standard Function
# Author:      Dhiabi Fathi
# Created:     19/03/2015
# Update:      24/04/2025
# Copyright:   (c) PyAMS 2025
# Web:         https://pyams.sf.net/
# Info:        standard Function
#-------------------------------------------------------------------------------
from math import exp
from pyams.lib.cpyams import time,temp,tnom


#-------------------------------------------------------------------------------
# math function
#-------------------------------------------------------------------------------



def explim(a):
    """
    Compute a limited exponential function to avoid overflow for large inputs.

    For values of 'a' less than 200, returns exp(a).
    For values of 'a' >= 200, approximates the exponential with a linear function:
        (a - 199) * exp(200)

    Parameters:
    a (float): The exponent value.

    Returns:
    float: The result of the limited exponential function.
    """
    if a >= 200.0:
        return (a - 199.0) * exp(200.0)
    return exp(a)



def trap(Aoff,A0,A1,Td,Tr,Tw,Tf,T):
    """
    This Trapezoidal Waveform function. The  waveform follows
    a trapezoidal shape with:


        A0 (param): Initial Amplitude.
        A1 (param): Peak  Amplitude.
        Td (param): Initial delay time.
        Tr (param): Rise time.
        Tw (param): Pulse-width (high duration).
        Tf (param): Fall time.
        T (param): Total period of the waveform.
        Aoff (param): Offset  Amplitude.

        A  (rturn): outpute Amplitude.

    The voltage waveform is defined as:

    - **Before initial delay (t ≤ Td):**
       A = A0 + Aoff

    - **During the rising edge (0 ≤ t ≤ Tr):**
      A = ((A1 - A0) / Tr) * t + A0 + Aoff

    - **During the high state (Tr ≤ t ≤ Tr + Tw):**
      A = A1 + Aoff

    - **During the falling edge (Tr + Tw ≤ t ≤ Tr + Tw + Tf):**
      A = ((A0 - A1) / Tf) * (t - Tr - Tw) + A1 + Aoff

    - **During the low state (t > Tr + Tw + Tf):**
      A = A0 + Aoff
    """

    t = time  # Get current simulation time

    # Before initial delay
    if t <= Td:
        return self.A0 + self.Aoff


    # Time within the current cycle
    cycle_time = (t - Td) % T

    # Rising edge: 0 → Tr
    if cycle_time <= self.Tr:
        slope = (A1 - A0) / Tr
        return slope * cycle_time + A0 + Aoff

    # High state: Tr → (Tr + Tw)
    elif cycle_time <= (Tr + Tw):
        return A1 + Aoff

    # Falling edge: (Tr + Tw) → (Tr + Tw + Tf)
    elif cycle_time <= (Tr + Tw + Tf):
         slope = (A0 -A1) / Tf
         return slope * (cycle_time - Tr - Tw) + A1 + Aoff

    # Low state: After (Tr + Tw + Tf)
    else:
         return A0 + Aoff



#-------------------------------------------------------------------------------
# temperature function
#-------------------------------------------------------------------------------




def toKelvin(degree):
    """
    Convert temperature from degrees Celsius to Kelvin.

    Parameters:
    degree (float): Temperature in degrees Celsius.

    Returns:
    float: Temperature in Kelvin, calculated as (degree + 273.15).
    """
    return degree + 273.15


def temperature(temp):
    """
    Convert temperature from degrees Celsius to Kelvin.

    Parameters:
    temp (float): Temperature in degrees Celsius.

    Returns:
    float: Temperature in Kelvin.
    """
    return 273.15 + temp


def vth(t=tnom):
    """
    Calculate the thermal voltage at a given temperature.

    Parameters:
    t (float or param): Temperature in degrees Celsius. Defaults to tnom (nominal temperature).

    Returns:
    float: Thermal voltage in volts, calculated as k*(T), where
           k = Boltzmann constant in eV/K (8.6173303e-5),
           T = temperature in Kelvin (t + 273).
    """
    # thermal voltage
    return 8.6173303e-5 * (t + 273)


def qtemp(tc1, tc2, t=temp):
    """
    Compute a quadratic temperature correction factor for a semiconductor parameter.

    This function models how a parameter varies with temperature using a quadratic expression:
        Q(T) = 1 + tc1*(T - Tnom) + tc2*(T - Tnom)^2

    Parameters:
    tc1 (float): Linear (first-order) temperature coefficient.
    tc2 (float): Quadratic (second-order) temperature coefficient.
    t (float or param):  Current temperature in degrees Celsius. Defaults to 'temp'.

    Returns:
    float: Temperature correction factor.
    """
    return 1 + tc1 * (t - tnom) + tc2 * (t - tnom) ** 2


def toCelsius(kelvin):
    """
    Convert temperature from Kelvin to degrees Celsius.

    Parameters:
    kelvin (float): Temperature in Kelvin.

    Returns:
    float: Temperature in degrees Celsius.
    """
    return kelvin - 273.15


def thermal_energy(t=temp):
    """
    Calculate thermal energy (kT) at a given temperature in Celsius.

    Parameters:
    t (float): Temperature in degrees Celsius. Defaults to global 'temp'.

    Returns:
    float: Thermal energy in electron-volts (eV).
    """
    k = 8.6173303e-5  # Boltzmann constant in eV/K
    return k * (t + 273.15)


def exp_temp_factor(t=temp):
    """
    Calculate the exponential temperature factor 1/(kT), commonly used in diode equations.

    Parameters:
    t (float): Temperature in degrees Celsius. Defaults to global 'temp'.

    Returns:
    float: 1/(kT) in 1/eV.
    """
    k = 8.6173303e-5  # Boltzmann constant in eV/K
    return 1 / (k * (t + 273.15))






#-------------------------------------------------------------------------------
# real function
#-------------------------------------------------------------------------------



def realTime():
    """
    Return the current real-world time.

    Returns:
    time.value: Current  time from the system .
    """
    return time.value

'''
def acSim(mag,phase):
    if ModAnaly.getSource:
        return 1
    return 0
    #return   mag*(cos(phase)+sin(phase)*(1j))
'''





