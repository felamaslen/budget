#!/bin/bash

set -e

cd $(dirname "$0")

image=$(./get_new_tag.sh)

./build-image.sh

echo "Pushing image..."
docker login docker.fela.space
docker push $image

cat ./manifest.yml \
  | sed -e "s/docker\.fela\.space\/budget\:0/$(echo $image | sed -e 's/\//\\\//')/g" \
  > ./manifest_with_image.yml

echo "Updating deployment..."
kubectl apply -f ./manifest_with_image.yml

rm -f manifest_with_image.yml

exit 0
