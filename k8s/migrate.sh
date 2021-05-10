#!/bin/bash

set -e

cd $(dirname "$0")

IMAGE=$(make -f ../Makefile get_image)

NAMESPACE="budget"

cat ./migrate.yml \
  | sed -e "s/docker\.fela\.space\/budget\:0/$(echo $IMAGE | sed -e 's/\//\\\//')/g" \
  > ./migrate_with_image.yml

JOB_NAME=budget-migrate

kubectl -n=$NAMESPACE delete job --ignore-not-found=true $JOB_NAME
kubectl -n=$NAMESPACE apply -f ./migrate_with_image.yml

# wait for pod to start running
pod_running=0
while [[ $pod_running == 0 ]]; do
  if [[ ! -z $(kubectl -n=$NAMESPACE get pods -lapp=$JOB_NAME -o json \
    | jq '.items[0].status.conditions[] | select(.type == "ContainersReady" and .status == "True")') ]]; then

    pod_running=1
  fi
  if [[ $pod_running == 0 ]]; then
    sleep 1
  fi
done

kubectl -n=$NAMESPACE logs -f -lapp=budget-migrate &

kubectl -n=$NAMESPACE wait --for=condition=complete job/$JOB_NAME --timeout=600s

rm -f migrate_with_image.yml

exit 0

