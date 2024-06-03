#!/bin/bash

set -xe

/usr/local/bin/gunicorn bmds_ui.main.wsgi \
    --bind 0.0.0.0:5000 \
    --chdir=/app \
    --timeout 300 \
    --workers $(nproc) \
    --log-level info \
    --log-file - \
    --max-requests 750 \
    --max-requests-jitter 250 \
    --capture-output
