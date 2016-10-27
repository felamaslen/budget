#!/bin/bash

echo "Starting uwsgi server..."

. env/bin/activate || exit 1
uwsgi --ini budget-uwsgi.ini

