# Development using SQLite (no PostgreSQL)

Make sure you have the following applications installed locally:

- [Git](https://git-scm.com/)
- [Python](https://www.python.org/) ≥ 3.13
- [Node.js](https://nodejs.org) ≥ 20
- [Yarn](https://yarnpkg.com/)
- [Visual Studio Build Tools for Desktop C++](https://visualstudio.microsoft.com/downloads/?q=build+tools) (including CMake and C++ compiler)

## Initial setup

Install [uv](https://docs.astral.sh/uv/); either via pip install or following the installation guide on the website. Instructions below have been written Windows. They may need to be adapted slightly for linux/mac.

Clone the repository and install all requirements into a virtual environment:

```bash
# clone repository; we'll put in ~/dev but you can put anywhere
mkdir dev
cd dev

# clone package and execution package
git clone https://github.com/USEPA/bmds bmds
git clone https://github.com/USEPA/bmds-ui

# Create virtual environment and install requirements
cd bmds-ui
uv venv --python=3.14

# Activate the environment
.venv\Scripts\activate
```

### Create a copy of bmds_ui/main/settings/local.example.py named 'local.py' and replace line

```python
# if "fixture" in DATABASES["default"]["NAME"]:
if "fixture" in str(DATABASES["default"]["NAME"]):
```

### Install requirements

```bash
uv pip install -e ".[pg,dev]"

cd ../
poe sync dev
```

## Running the application

You'll need to run both the python webserver and the node webserver to develop the application.

In one terminal, start the the python webserver:

```bash
# active python virtual environment
.venv\Scripts\activate

# run development webserver
poe run-py
```

In another terminal, start the node frontend webserver:

```bash
# start node hot-reloading server
poe run-js
```

Access the app http://127.0.0.1:8100/
