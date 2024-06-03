FROM python:3.11-slim-bullseye

ENV BMDS_UI_VERSION=24.1a0
ENV BMDS_VERSION=24.1a0
ENV EXTRA_BMDS_BUILD_ARGS=

RUN groupadd -g 555 -r app && \
    useradd -u 555 -r -g app app

# dependencies wait-for: netcat
# dependencies bmds: libgslcblas0 libgsl-dev
RUN apt-get update -y && \
    apt-get install -y netcat libgslcblas0 libgsl-dev

COPY ./compose/app/wait-for.sh /app/bin/wait-for.sh
COPY ./compose/app/sync.sh /app/bin/sync.sh
COPY ./compose/app/web.sh /app/bin/web.sh
COPY ./compose/app/workers.sh /app/bin/workers.sh
COPY ./compose/app/cron.sh /app/bin/cron.sh
COPY ./compose/app/test.py /app/test.py

# used in some dev/staging environments
COPY ./tests/data/db.yaml /app/test-db-fixture.yaml

# 1) install start-scripts
# 2) install fonts
# 3) create logs path
RUN mkdir -p /app/logs && \
    mkdir -p /app/public/media

COPY ./dist /dist
COPY ./vendor /vendor

RUN mv /vendor/libnlopt.so /usr/local/lib/libnlopt.so.0 && \
    \
    pip install -U pip && \
    pip install "${EXTRA_BMDS_BUILD_ARGS} pybmds==${BMDS_VERSION}" --no-cache-dir && \
    pip install "dist/bmds_ui-${BMDS_UI_VERSION}-py3-none-any.whl[pg,prod]" --no-cache-dir && \
    \
    rm -rf /vendor /dist && \
    pip uninstall -y pip

WORKDIR /app

RUN chown -R app:app /app
USER app

ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

RUN ldd /usr/local/lib/python3.11/site-packages/pybmds/bmdscore.cpython-*-x86_64-linux-gnu.so && \
    python /app/test.py
