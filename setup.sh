#!/bin/bash

virtualenv srv || exit 1
. srv/bin/activate
srv/bin/pip install -r deps.txt
deactivate

exit 0
