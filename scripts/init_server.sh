#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Starting uwsgi server..."

. env/bin/activate || exit 1

if [[ $1 == "--dev" ]]; then
  uwsgi --ini resources/budget-uwsgi.dev.ini
else
  uwsgi --ini resources/budget-uwsgi.ini
fi

