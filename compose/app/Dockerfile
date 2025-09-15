FROM python:3.13-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=UTF-8 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=off \
    LANG=C.UTF-8

RUN groupadd -g 555 -r app && \
    useradd -u 555 -r -g app app

RUN apt-get -y update && \
    apt-get -y upgrade && \
    apt-get -y install --no-install-recommends netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

COPY ./compose/app/wait-for.sh /app/bin/wait-for.sh
COPY ./compose/app/sync.sh /app/bin/sync.sh
COPY ./compose/app/web.sh /app/bin/web.sh
COPY ./compose/app/workers.sh /app/bin/workers.sh
COPY ./compose/app/cron.sh /app/bin/cron.sh
COPY ./tests/data/db.yaml /app/test-db-fixture.yaml
COPY ./dist /dist

RUN python -m ensurepip --upgrade && \
    python -m pip install -U pip && \
    \
    python -m pip install "$(ls dist/bmds_ui-*.whl | head -1)[pg,prod]" --no-cache-dir && \
    \
    rm -rf /dist && \
    python -m pip uninstall -y pip && \
    \
    chown -R app:app /app

WORKDIR /app
USER app
