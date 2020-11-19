#!/bin/bash

set -e

cd $(dirname "$0")

IMAGE=$(make -f ../Makefile get_image)

namespace="budget"

cat ./manifest.yml \
  | sed -e "s/docker\.fela\.space\/budget\:0/$(echo $IMAGE | sed -e 's/\//\\\//')/g" \
  > ./manifest_with_image.yml

echo "Updating deployment..."
kubectl -n=$namespace apply -f ./manifest_with_image.yml

rm -f manifest_with_image.yml

exit 0
