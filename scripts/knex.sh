#!/bin/bash

cd "$(dirname "$0")/.."

if [[ $NODE_ENV == "production" ]]; then
  ./node_modules/.bin/knex --knexfile api/build/knexfile.js $@
else
  node -r tsconfig-paths/register ./node_modules/.bin/knex --knexfile api/src/knexfile.ts $@
fi

exit 0
