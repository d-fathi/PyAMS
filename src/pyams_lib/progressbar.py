#-------------------------------------------------------------------------------
# Name:        Progress bar
# Author:      dhiab fathi
# Created:     10/01/2025
# Update:      27/02/2025
# Copyright:   (c) PyAMS 2025
# Licence:     GPLv3
#-------------------------------------------------------------------------------

import time
import sys
import json

def displayBarPage(current, total, start_time):
    progress = current / total
    elapsed_time = time.time() - start_time
    elapsed_str = f"{int(elapsed_time // 60)}:{int(elapsed_time % 60):02}"

    output = {
        "progress": int(progress * 100),
        "elapsed_time": elapsed_str
    }

    print(json.dumps(output), flush=True)
    return elapsed_str;

def starTime():
      return time.time()


def displayBar(current, total, start_time):
    bar_length = 40  # Length of the progress bar
    progress = current / total
    elapsed_time = time.time() - start_time
    elapsed_str = f"{int(elapsed_time // 60)}:{int(elapsed_time % 60):02}"  # Format as MM:SS

    # Create the progress bar
    filled_length = int(bar_length * progress)
    bar = "█" * filled_length + "-" * (bar_length - filled_length)

    # Print the progress bar
    sys.stdout.write(f"\r[Elapsed Time: {elapsed_str}] |{bar}| {int(progress * 100)}%")
    sys.stdout.flush()

if __name__ == '__main__':
    # Simulate a task
    total_steps = 100
    start_time = time.time()

    for i in range(1, total_steps + 1):
      time.sleep(0.1)  # Simulate work
      displayBar(i, total_steps, start_time)

    print("\nTask completed!")
