#!/bin/bash

set -e

echo "Checking types..."
yarn check-types

rm -rf api/build web/build

export BABEL_ENV=node
export NODE_ENV=production

echo "Building API..."
yarn build:api:main

echo "Building SSR bundle..."
yarn build:api:ssr

echo "Minifying introspection.json..."
yarn minify-introspection

echo "Building client bundle..."
yarn build:client

exit 0
