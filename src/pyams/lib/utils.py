#-------------------------------------------------------------------------------
# Name:        utils
# Purpose:
# Author:      dhiab fathi
# Created:     05/01/2025
# Update:
# Copyright:   (c) PyAMS 2025
# Licence:     <your licence>
#-------------------------------------------------------------------------------


def float_to_str(value: float) -> str:
    """
    Converts a floating-point number to a human-readable string with appropriate units.
    Args:
        value (float): The numeric value to convert.
    Returns:
        str: A formatted string representation with units.
    """

    units = {
        'f': 1e-15, 'p': 1e-12, 'n': 1e-9, 'µ': 1e-6, 'm': 1e-3,
        ' ': 1.0, 'k': 1e3, 'M': 1e6, 'T': 1e9
    }

    abs_value = abs(value)
    sign = '-' if value < 0 else ''

    # Iterate over units in descending order of scale
    for unit, scale in reversed(units.items()):
        if abs_value >= scale:
            scaled_value = abs_value / scale
            # Format the value to two decimal places, stripping trailing zeros
            formatted_value = f"{scaled_value:.2f}".rstrip('0').rstrip('.')
            return f"{sign}{formatted_value}{unit}"

    # Fallback for very small values (less than the smallest unit)
    return f"{value:.2e}"



def str_to_float(value: str) -> float:
    """
    Convert a string with unit suffix to a float.
    Args:
        value (str): The input string to convert, e.g., "1.2k", "3.5M", "100u".
    Returns:
        float: The corresponding numeric value.
    Raises:
        ValueError: If the input string cannot be parsed.
    """
    units = {
        'f': 1e-15, 'p': 1e-12, 'n': 1e-9, 'µ': 1e-6, 'u': 1e-6, 'm': 1e-3,
        ' ': 1.0, 'k': 1e3, 'K': 1e3, 'M': 1e6, 'T': 1e9
    }
    value = value.strip()  # Remove any surrounding whitespace
    num_part = ''
    unit_part = ''

    # Split the numeric and unit parts
    for char in value:
        if char.isdigit() or char in ['.', '-', '+', 'e', 'E']:
            num_part += char
        else:
            unit_part += char

    # Default unit to an empty space (interpreted as 1.0 multiplier)
    unit_part = unit_part.strip() or ' '

    try:
        number = float(num_part)  # Convert the numeric part to a float
        multiplier = units.get(unit_part, None)  # Look up the multiplier
        if multiplier is None:
            return number
        return number * multiplier
    except ValueError as e:
        raise ValueError(f"Invalid input '{value}': {e}") from e

def value(v):
    return str_to_float(v)
    




