# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = 'PyAMS'
copyright = '(c) 2021-2025, PyAMS'
author = 'd.fathi'

# The full version, including alpha/beta/rc tags
release = '0.1.6'
version='PyAMS 0.1.6'


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = ['sphinx.ext.autodoc',
              'sphinx.ext.napoleon',
              'sphinx.ext.autosectionlabel',
              'sphinx_rtd_theme',
               'sphinx_panels',
              'sphinx_math_dollar']

mathjax_config = {
    'tex2jax': {
        'inlineMath': [ ["\\(","\\)"] ],
        'displayMath': [["\\[","\\]"] ],
    },
}


# Add any paths that contain templates here, relative to this directory.
templates_path = ['sphinx_rtd_theme']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']
html_logo = "logo_01.png"
html_favicon = "logo_01.png"
html_theme_options = {
    "navigation_depth": 5,
    "collapse_navigation": False,
      "logo_only": True,
    "display_version": True
}

#"navigation_depth": 3,
#"includehidden": True,
#"titles_only": True

html_show_sourcelink = False
highlight_language = 'none'

html_context = {
    "display_github": True,
    "github_user": "d-fathi",
    "github_repo": "pyams",
    "github_version": "main", 
    "conf_py_path": "/docs/", 
    "pypi_project": "https://pypi.org/project/pyams-cad/" 
}
