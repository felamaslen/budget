#!/bin/bash

virtualenv env || exit 1
. env/bin/activate
env/bin/pip install -r deps.txt
deactivate

exit 0
