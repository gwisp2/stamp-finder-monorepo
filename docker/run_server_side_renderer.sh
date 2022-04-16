#!/usr/bin/env sh

set -e

cd /app
node build-server/generate.js --watch --db=/app/data --out /app/ssr/index.html --template /app/template.html
