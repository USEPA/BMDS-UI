# Development using SQLite (no PostgreSQL)

Make sure you have the following applications installed locally:

- [Git](https://git-scm.com/)
- [Python](https://www.python.org/) = 3.12
- [Node.js](https://nodejs.org) ≥ 20
- [Yarn](https://yarnpkg.com/)
- [Visual Studio Build Tools for Desktop C++](https://visualstudio.microsoft.com/downloads/?q=build+tools) (including CMake and C++ compiler)

## Initial setup

Install [uv](https://docs.astral.sh/uv/); either via pip install or following the installation guide on the website. Instructions below have been written Windows. They may need to be adapted slightly for linux/mac.

Clone the repository and install all requirements into a virtual environment:

```bash
# In your project folder, clone repositories

# clone package and execution package
git clone https://github.com/USEPA/bmds bmds
git clone https://github.com/USEPA/bmds-ui

# Create virtual environment and install requirements
cd bmds-ui
uv venv --python=3.12

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
poe sync-dev
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

## Setup using local pybmds

Install Python 3.12

```bash
cd "C:\Users\srizwan\BMDS\bmds-ui"
.venv\Scripts\activate
uv python install 3.12.9
```

If needed, delete the existing venv and create a new one with python 3.12

```bash
cd "C:\Users\srizwan\BMDS\bmds-ui"
rmdir /s /q .venv
uv venv --python 3.12 .venv
```

_python 3.12 is required because pybind11 via vcpkg is hard-coded to use its own bundled python 3.12_

Remove the pybmds dependency in bmds-ui/pyproject.toml

```bash
dependencies = [
  # "pybmds==25.2",
```

In Developer Command Prompt, clone and bootstrap vcpkg

```bash
cd "C:\Users\srizwan\BMDS\"
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
bootstrap-vcpkg.bat
```

Open bmds/vcpkg.json and add the pybind11 dependency

```json
{
  "name": "bmdscore",
  "version-string": "0.0.1",
  "dependencies": [
    { "name": "gsl" },
    { "name": "eigen3" },
    { "name": "nlopt" },
    { "name": "openblas" },
    { "name": "pybind11" }
  ],
  "builtin-baseline": "c9c17dcea3016bc241df0422e82b8aea212dcb93",
  "overrides": [
    { "name": "gsl", "version": "2.8#1" },
    { "name": "eigen3", "version": "3.4.0#5" },
    { "name": "nlopt", "version": "2.10.0" }
  ]
}
```

Install all required C++ dependencies into the bmds folder.
_This will take ~1 hour the first time. Repeat this step if dependencies change._

```bash
cd "C:\Users\srizwan\BMDS\bmds"

"C:\Users\srizwan\BMDS\vcpkg\vcpkg.exe" install --triplet x64-windows --x-install-root=vcpkg_installed

```

Set environmental varibales.
_Repeat this step every time a fresh Developer Command Prompt is opened_

```bash
set VCPKG_ROOT=C:\Users\srizwan\BMDS\vcpkg
set VCPKG_HOST_TRIPLET=x64-windows
set VCPKG_TARGET_TRIPLET=x64-windows
set CMAKE_TOOLCHAIN_FILE=C:\Users\srizwan\BMDS\vcpkg\scripts\buildsystems\vcpkg.cmake
```

Activate the venv and install bmds.
_This step needs to be repeated when bmdscore source code changes._

```bash
cd "C:\Users\srizwan\BMDS\bmds-ui"
.venv\Scripts\activate
pip uninstall pybmds
uv pip install -e "../bmds" -v
```

Copy DLLs next to pyd file so Windows can always find them

```bash
copy "C:\Users\srizwan\BMDS\bmds\vcpkg_installed\x64-windows\bin\gsl.dll" "C:\Users\srizwan\BMDS\bmds\src\pybmds\"
copy "C:\Users\srizwan\BMDS\bmds\vcpkg_installed\x64-windows\bin\gslcblas.dll" "C:\Users\srizwan\BMDS\bmds\src\pybmds\"
copy "C:\Users\srizwan\BMDS\bmds\vcpkg_installed\x64-windows\bin\nlopt.dll" "C:\Users\srizwan\BMDS\bmds\src\pybmds\"

```

run

```bash
# Terminal #1
poe sync-dev
poe run-py
```

Open another terminal and boot up frontend

```bash
# Terminal #2
cd "C:\Users\srizwan\BMDS\bmds-ui"
.venv\Scripts\activate
poe run-js
```

Access the app http://127.0.0.1:8100/

## TROUBLESHOOTING:

_TIP: Try setting up your development environment outside of One Drive. If your bmds/bmds-ui repositories and vcpkg folder are inside One Drive, the spaces and parenthesis in the paths can cause issues with package installation._

### error: Failed to spawn: `yarn` Caused by: program not found

in bmds-ui/pyproject.toml under [tool.poe.tasks.sync-dev], change the line

```bash
# {cmd = "yarn --cwd frontend"},
{cmd = "yarn.cmd --cwd frontend"},
```

### error: Failed to spawn: `npm` Caused by: program not found

in bmds-ui/pyproject.toml under [tool.poe.tasks.run-js], change the line

```bash
# cmd = "npm --prefix ./frontend run start"
cmd = "npm.cmd --prefix ./frontend run start"
```

## Everyday Setup

```bash
# Developer Command Prompt terminal #1
cd "C:\Users\srizwan\BMDS\bmds-ui"
.venv\Scripts\activate

# Set session varibles
# *** Skip this step if you are not using local pybmds ***
set VCPKG_ROOT="C:\Users\srizwan\BMDS\vcpkg"
set VCPKG_HOST_TRIPLET=x64-windows
set VCPKG_TARGET_TRIPLET=x64-windows
set CMAKE_TOOLCHAIN_FILE= " C:\Users\srizwan\BMDS\vcpkg\scripts\buildsystems\vcpkg.cmake"

# spin up backend
poe run-py
```

```bash
# terminal #2
cd "C:\Users\srizwan\BMDS\bmds-ui"
.venv\Scripts\activate
poe run-js
```

Access the app http://127.0.0.1:8100/

## Run UI TESTS

```bash
cd "C:\Users\srizwan\BMDS\bmds-ui"
.venv\Scripts\activate
uv run pytest tests
```
