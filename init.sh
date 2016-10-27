#!/bin/bash

. env/bin/activate || exit 1
uwsgi --ini uwsgi.ini

