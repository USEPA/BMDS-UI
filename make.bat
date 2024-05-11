@ECHO off

if "%~1" == "" goto :help
if /I %1 == help goto :help
if /I %1 == sync-dev goto :sync-dev
if /I %1 == docs goto :docs
if /I %1 == docs-serve goto :docs-serve
if /I %1 == docs-all goto :docs-all
if /I %1 == test goto :test
if /I %1 == lint goto :lint
if /I %1 == format goto :format
if /I %1 == test-py goto :test-py
if /I %1 == lint-py goto :lint-py
if /I %1 == format-py goto :format-py
if /I %1 == test-js goto :test-js
if /I %1 == lint-js goto :lint-js
if /I %1 == format-js goto :format-js
if /I %1 == coverage goto :coverage
goto :help

:help
echo.Please use `make ^<target^>` where ^<target^> is one of
echo.  sync-dev     sync dev environment after code checkout
echo.  docs         Build documentation {html}
echo.  docs-serve   Realtime documentation preview
echo.  docs-all     Build documentation {html, docx}
echo.  test         perform both test-py and test-js
echo.  coverage     generate test coverage report
echo.  test-py      run python tests
echo.  test-js      run javascript tests
echo.  lint         check formatting issues
echo.  lint-py      check python formatting issues
echo.  lint-js      check javascript formatting issues
echo.  format       fix formatting issues where possible
echo.  format-py    fix python formatting issues where possible
echo.  format-js    fix javascript formatting issues where possible
goto :eof

:sync-dev
python -m pip install -U pip uv
uv pip install -e ".[pg,dev]"
yarn --cwd frontend
manage.py migrate
goto :eof

:docs
rmdir /s /q docs\build
sphinx-build -b html docs/source docs/build/html
goto :eof

:docs-serve
rmdir /s /q docs\build
sphinx-autobuild -b html docs/source docs/build/html --port 5555
goto :eof

:docs-all
rmdir /s /q docs\build
sphinx-build -b html docs/source docs/build/html
sphinx-build -b singlehtml docs/source docs/build/singlehtml
cd docs\build\singlehtml
pandoc -s index.html -o pybmds.docx
cd ../../..
goto :eof

:lint
ruff format . --check && ruff check .
npm --prefix .\frontend run lint
goto :eof

:format
ruff format . && ruff check . --fix --show-fixes
npm --prefix .\frontend run format
goto :eof

:lint-py
ruff format . --check && ruff check .
goto :eof

:format-py
ruff format . && ruff check . --fix --show-fixes
goto :eof

:lint-js
npm --prefix .\frontend run lint
goto :eof

:format-js
npm --prefix .\frontend run format
goto :eof

:test
py.test
npm --prefix .\frontend run test-windows
goto :eof

:test-py
py.test
goto :eof

:test-js
npm --prefix .\frontend run test-windows
goto :eof

:coverage
coverage run -m pytest
coverage html -d coverage_report
echo "Report ready; open ./coverage_html/index.html to view"
