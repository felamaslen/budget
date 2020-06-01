#!/bin/bash

output=$(ts-prune -p web/tsconfig.json \
  | grep -v test-data \
  | grep -v types\/index.ts \
  | grep -v selectors\/index.ts \
  | grep -v graph\/index.tsx
)

if [[ -z "$output" ]]; then
  exit 0
fi

>&2 echo "Some exports need pruning:"
>&2 echo "$output"

exit 1
