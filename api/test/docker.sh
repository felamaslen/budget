#!/bin/bash

set -e

docker-compose -f docker-test.yml down

docker-compose -f docker-test.yml up -d db_test

echo "Waiting 5 seconds for database"
sleep 5

docker-compose -f docker-test.yml exec db_test bash -c "createdb -U docker budget"
docker-compose -f docker-test.yml exec db_test bash -c "psql -U docker budget -c \"create extension if not exists \\\"uuid-ossp\\\";\""

docker-compose -f docker-test.yml up -d --build

docker-compose -f docker-test.yml run budget_test sh -c "./node_modules/.bin/knex migrate:latest"
docker-compose -f docker-test.yml run budget_test sh -c "./node_modules/.bin/knex seed:run"

set +e
docker-compose -f docker-test.yml run budget_test sh -c "./node_modules/.bin/ava \"./api/test/**/*.spec.js\""
set -e

docker-compose -f docker-test.yml down

rc=$?

exit $rc
