#!/usr/bin/env bash

set -e;

UWSGI_HOST="${VARIABLE:-0.0.0.0}"
UWSGI_PORT="${VARIABLE:-5000}"

cd /app
uwsgi --master \
      --socket "$UWSGI_HOST:$UWSGI_PORT" \
      --manage-script-name \
      --mount /=sfb.main_flask:app \
      --processes 2
