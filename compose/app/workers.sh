#!/bin/bash

set -xe

/usr/local/bin/celery \
    --app=bmds_ui.main.celery \
    worker \
    --loglevel=INFO
