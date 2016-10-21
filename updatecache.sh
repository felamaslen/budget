#!/bin/bash

function update_js {
  rm js/main.min.js
  touch js/main.min.js

  cat js/jquery.min.js >> js/main.min.js
  cat js/js.cookie.min.js >> js/main.min.js
  babel js/budget.es6.js | uglifyjs -m >> js/main.min.js
}

function update_css {
  uglifycss css/budget.css > css/budget.min.css
}

function update_serial {
  # increase serial
  serial_file=./serial

  serial_no=1

  date_now=$(date +%Y%m%d)

  if [ -e $serial_file ]; then
    serial_info=$(cat $serial_file)

    serial_no=$(echo $serial_info | awk '{s=substr($1,9,length($1))}{print s}')
    serial_date=$(echo $serial_info | awk '{d=substr($1,0,8)}{print d}')

    if [ $serial_date -eq $date_now ]; then
      serial_no=$(($serial_no + 1))
    fi
  fi

  date_string="$date_now$serial_no"

  echo $date_string > $serial_file
}

function switch {
  case $1 in
    "js")
      echo "Updating JS..."
      update_js
      ;;
    "css")
      echo "Updating CSS..."
      update_css
      ;;
  esac
}

if [[ ! -z $1 ]]; then
  switch $1
fi

if [[ ! -z $2 && $2 != $1 ]]; then
  switch $2
fi

update_serial

exit 0
