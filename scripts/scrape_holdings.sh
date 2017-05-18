#!/bin/bash

# get the latest top holdings (they're updated every month or so)

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

./env/bin/python ./srv/scrape_funds.py holdings $1 || exit 1

exit 0
