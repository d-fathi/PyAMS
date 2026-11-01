"""Scan a folder of PyAMS model files and report every ``class Name(model)``.

Usage:  python scanModels.py <models_dir>

Prints one JSON document on stdout:
    {"files": [{"name": "Diode.py", "fullPath": "...", "relativePath": "Diode.py",
                "classes": [{"name": "Diode", "line": 7, "source": "class Diode(model): ..."}],
                "error": null}]}

The files are only parsed (ast), never imported or executed.
"""
import ast
import json
import os
import sys


def _base_name(node):
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return None


def find_model_classes(tree, base='model'):
    """Return ClassDef nodes deriving (directly or through another class of the
    same file) from ``model``."""
    classes = [n for n in tree.body if isinstance(n, ast.ClassDef)]
    known = {base}
    found = []
    changed = True
    while changed:
        changed = False
        for cls in classes:
            if cls in found:
                continue
            if any(_base_name(b) in known for b in cls.bases):
                found.append(cls)
                known.add(cls.name)
                changed = True
    return sorted(found, key=lambda c: c.lineno)


def scan_file(path, root):
    entry = {
        'name': os.path.basename(path),
        'fullPath': path,
        'relativePath': os.path.relpath(path, root),
        'classes': [],
        'error': None,
    }
    try:
        with open(path, 'r', encoding='utf-8-sig') as f:
            text = f.read()
        tree = ast.parse(text, filename=path)
        for cls in find_model_classes(tree):
            entry['classes'].append({
                'name': cls.name,
                'line': cls.lineno,
                'source': ast.get_source_segment(text, cls) or '',
            })
    except (OSError, SyntaxError, ValueError) as exc:
        entry['error'] = '%s: %s' % (type(exc).__name__, exc)
    return entry


def scan_dir(root):
    files = []
    for folder, dirs, names in os.walk(root):
        dirs[:] = sorted(d for d in dirs if d != '__pycache__')
        for name in sorted(names):
            if name.endswith('.py') and name != '__init__.py':
                entry = scan_file(os.path.join(folder, name), root)
                if entry['classes'] or entry['error']:
                    files.append(entry)
    return {'files': files}


def main(argv):
    if len(argv) != 2 or not os.path.isdir(argv[1]):
        json.dump({'files': [], 'error': 'models directory not found'}, sys.stdout)
        return 1
    out = json.dumps(scan_dir(os.path.abspath(argv[1])), ensure_ascii=True)
    sys.stdout.write(out)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
