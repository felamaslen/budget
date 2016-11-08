#!/bin/bash

### access and modify budget data through a command line interface

cd $(dirname "${BASH_SOURCE[0]}")

. env/bin/activate || exit 1

read -n 1 -p "What do you want to do? " task

python srv/cli.py $task

deactivate

exit 0

