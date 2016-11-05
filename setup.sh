#!/bin/bash

E_NO_DIR="Error: could not access base directory"
E_NO_DEV="Please run \`setup.sh dev\` first to create a development environment"

MSG_SETUP_PYTHON="Setting up python environment..."
MSG_SETUP_DEV="Setting up development environment..."

E_NO_LESS="Less not available; did node install its modules successfully?"

function setup_python {
  # set up python environment
  echo $MSG_SETUP_PYTHON
  virtualenv env || exit 1
  . env/bin/activate
  env/bin/pip install -r resources/deps.txt
  deactivate
}

function setup_dev {
  # set up development environment
  echo $MSG_SETUP_DEV
  npm install
}

function build {
  if [[ ! -d ./node_modules ]]; then
    echo $E_NO_DEV
    exit 1
  fi

  lessc="./node_modules/less/bin/lessc"

  if [[ ! -e $lessc ]]; then
    echo $E_NO_LESS
    exit 1
  fi

  $lessc resources/budget.less > web/css/budget.css

  exit 0
}

cd $(dirname "${BASH_SOURCE[0]}") || {
  echo $E_NO_DIR
  exit 1
}

if [[ ! -e ./env/bin/python ]]; then
  setup_python
fi

if [[ $1 == "dev" ]]; then
  setup_dev
elif [[ $1 == "build" ]]; then
  build || exit 1
elif [[ $1 == "install" ]]; then
  read -p "Database username: " dbusername

  echo ""
  echo "WARNING: continuing may destroy data currently in the budget database!"
  read -p "Continue? [y/N] " do_import

  if [[ $do_import == "y" || $do_import == "Y" ]]; then
    mysql -u $dbusername -p budget < resources/schema.sql
  else
    echo "Doing nothing"
  fi
fi 

exit 0
