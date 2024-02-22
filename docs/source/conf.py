# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "BMDS webserver"
copyright = "2024, USEPA"
author = "USEPA"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    "myst_parser",
]
souce_suffix = {
    ".md": "markdown",
    ".rst": "restructuredtext",
}
templates_path = ["_templates"]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
exclude_patterns = []

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# html_theme = "alabaster"
html_theme = "pydata_sphinx_theme"


html_static_path = ["_static"]
html_sidebars = {"**": ["globaltoc.html"]}  # 'searchbox.html'

html_theme_options = {
    "icon_links": [
        {
            # Label for this link
            "name": "GitHub",
            # URL where the link will redirect
            "url": "https://github.com/USEPA/bmds-online-private",  # required
            # Icon class (if "type": "fontawesome"), or path to local image (if "type": "local")
            "icon": "fa-brands fa-github",
            # The type of image to be used (see below for details)
            "type": "fontawesome",
        },
        {
            "name": "U.S. Environmental Protection Agency",
            "url": "https://epa.gov",  # required
            "icon": "_static/img/epa_logo.png",
            "type": "local",
        },
    ],
    "use_edit_page_button": False,
    # "primary_sidebar_end": ["indices.html"],
    "show_toc_level": 2,
    "navbar_end": [
        "theme-switcher.html",
        "navbar-icon-links.html",
    ],
}

# -- Options for LaTeX output ---------------------------------------------

latex_elements = {
    "printindex": "",
    "sphinxsetup": "hmargin={0.9in,0.9in}, vmargin={0.9in,0.9in}, marginpar=1.0in",
    # The paper size ('letterpaper' or 'a4paper').
    "papersize": "letterpaper",
    # The font size ('10pt', '11pt' or '12pt').
    "pointsize": "10pt",
    "figure_align": "htbp",
}
