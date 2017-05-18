#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Starting uwsgi server..."

. env/bin/activate || exit 1
uwsgi --ini resources/budget-uwsgi.ini

