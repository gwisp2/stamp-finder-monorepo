#!/usr/bin/env bash

set -e;

supervisord -c /app/docker/supervisord.conf
