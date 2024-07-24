project = "BMDS webserver"
copyright = "Public Domain"
author = "U.S. EPA"

extensions = ["myst_parser"]
souce_suffix = {
    ".md": "markdown",
    ".rst": "restructuredtext",
}
templates_path = ["_templates"]

exclude_patterns = []


# HTML settings
html_theme = "furo"
html_static_path = ["_static"]
html_css_files = ["css/style.css"]
html_sidebars = {"**": ["globaltoc.html"]}
html_theme_options = {}

# Latex / PDF settings
latex_elements = {
    "printindex": "",
    "sphinxsetup": "hmargin={0.9in,0.9in}, vmargin={0.9in,0.9in}, marginpar=1.0in",
    "papersize": "letterpaper",
    "pointsize": "10pt",
    "figure_align": "htbp",
}
