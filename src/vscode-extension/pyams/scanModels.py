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


IGNORED_DIRS = {'__pycache__', 'node_modules', '.git', '.vscode', '.venv', 'venv', 'site-packages'}


def _inside(path, folder):
    rel = os.path.relpath(path, folder)
    return rel == '.' or not (rel.startswith('..') or os.path.isabs(rel))


def scan_dir(root, label=None, skip=None):
    """Model files of a folder tree.  label=None: the PyAMS library (name = file name).
    label='Project': a project folder: relativePath is 'Project/sub/File.py', origin 'project'."""
    files = []
    for folder, dirs, names in os.walk(root):
        dirs[:] = sorted(d for d in dirs
                         if d not in IGNORED_DIRS and (label is None or not d.startswith('.'))
                         and not (skip and _inside(os.path.join(folder, d), skip)))
        for name in sorted(names):
            if name.endswith('.py') and name != '__init__.py':
                entry = scan_file(os.path.join(folder, name), root)
                if entry['classes'] or entry['error']:
                    if label is not None:
                        rel = os.path.relpath(entry['fullPath'], root).replace(os.sep, '/')
                        entry['relativePath'] = label + '/' + rel
                        entry['name'] = entry['relativePath']
                        entry['origin'] = 'project'
                        entry['module'] = os.path.splitext(os.path.basename(entry['fullPath']))[0]
                    else:
                        entry['origin'] = 'library'
                    files.append(entry)
    return {'files': files}


def main(argv):
    """scanModels.py <models_dir> [<label> <project_dir> ...]"""
    if len(argv) < 2 or not os.path.isdir(argv[1]) or (len(argv) - 2) % 2:
        json.dump({'files': [], 'error': 'models directory not found'}, sys.stdout)
        return 1
    models = os.path.abspath(argv[1])
    result = scan_dir(models)
    for i in range(2, len(argv), 2):
        if os.path.isdir(argv[i + 1]):
            result['files'] += scan_dir(os.path.abspath(argv[i + 1]), argv[i], skip=models)['files']
    sys.stdout.write(json.dumps(result, ensure_ascii=True))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
