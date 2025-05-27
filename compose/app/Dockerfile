FROM quay.io/centos/centos:stream9-minimal

ENV PYTHON_VERSION=3.13 \
    PYTHONBUFFERED=1 \
    PYTHONIOENCODING=UTF-8 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE=off \
    LANG=C.UTF-8

RUN groupadd -g 555 -r app && \
    useradd -u 555 -r -g app app && \
    \
    INSTALL_PKGS="python${PYTHON_VERSION} nc" && \
    VERIFY_PKGS="python${PYTHON_VERSION}" && \
    microdnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $VERIFY_PKGS && \
    microdnf -y clean all --enablerepo='*' && \
    ln -s /usr/bin/"python${PYTHON_VERSION}" /usr/local/bin/python

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
    for file in dist/bmds_ui-*.whl; do python -m pip install "$file[pg,prod]" --no-cache-dir ; done && \
    \
    rm -rf /dist && \
    python -m pip uninstall -y pip && \
    \
    chown -R app:app /app

WORKDIR /app
USER app
