#-------------------------------------------------------------------------------
# Name:        find class of models
# Author:      dhiab fathi
# Created:     04/05/2025
# Copyright:   (c) pyams 2025
#-------------------------------------------------------------------------------

import os

def find_class_definition(class_name, root_dir='.'):
    matches = []
    print(root_dir);
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.py'):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        for lineno, line in enumerate(file, start=1):
                            if line.strip().startswith(f'class {class_name}'):
                                matches.append((filepath, lineno, line.strip()))
                except (UnicodeDecodeError, FileNotFoundError):
                    continue
    return matches




if __name__ == '__main__':
    results =find_class_definition('Resistor', '.\\models')
    print(results)
    for path, line_number, code in results:
      print(f'{path}:{line_number}: {code}')
