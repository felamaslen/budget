#!/bin/sh

set -e

echo "Checking types..."
yarn check-types

rm -rf lib static

echo "Building API..."
yarn build:api:main

echo "Building SSR bundle..."
yarn build:api:ssr

echo "Minifying introspection.json..."
yarn minify-introspection

echo "Building client bundle..."
yarn build:client

exit 0
