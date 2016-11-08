#!/bin/bash

### access and modify budget data through a command line interface

get_method() {
  read -n 1 -p "Method? [[G]et, [p]ost] " raw

  if [ -z $raw ]; then raw="g"; fi

  local ltr=$(echo $raw | head -c 1 | tr '[:upper:]' '[:lower:]')

  if [[ $ltr == "g" ]]; then
    method="GET"
  elif [[ $ltr == "p" ]]; then
    method="POST"
  else
    echo
    echo "Invalid method."
    exit 1
  fi
}

get_uid() {
  read -n 1 -p "User id? [1] " raw

  if [[ -z "$raw" ]]; then
    raw="1";
  fi

  uid=$(printf '%d' $raw)

  if [[ $uid < 1 ]]; then
    echo
    echo "Invalid uid."
    exit 1
  fi
}

get_task() {
  read -p "Task? " task
}
get_args() {
  read -p "Arguments? (query string) [optional] " args
}
get_form() {
  read -p "Form? (query string) " form
}

cd $(dirname "${BASH_SOURCE[0]}")

. env/bin/activate || exit 1

form=""

get_method
get_uid
get_task
get_args
if [[ $method == "POST" ]]; then
  get_form
fi

echo "python srv/cli.py $method $uid $task $args $form"

deactivate

exit 0

