#!/bin/bash

set -e

if [[ -z "$IMAGE" ]]; then
  echo "Must set IMAGE"
  exit 1
fi

cd $(dirname "$0")

namespace="budget"

cat ./manifest.yml \
  | sed -e "s/docker\.fela\.space\/budget\:0/$(echo $IMAGE | sed -e 's/\//\\\//')/g" \
  > ./manifest_with_image.yml

echo "Updating deployment..."
kubectl -n=$namespace apply -f ./manifest_with_image.yml

rm -f manifest_with_image.yml

exit 0
