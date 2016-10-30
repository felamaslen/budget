#!/bin/bash

cd $(dirname "${BASH_SOURCE[0]}") || exit 1

./env/bin/python cache_funds.py $1 || exit 1

exit 0
