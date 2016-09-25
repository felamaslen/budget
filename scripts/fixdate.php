<?php

$csv = dirname(__FILE__) . '/../data/Budget - Social.csv';

$tmp = $csv . '.tmp';

$handle = fopen($csv, 'r');

if (!$handle) {
  print 'Couldn\'t open file for reading';
  die;
}

$handle_w = fopen($tmp, 'w');

if (!$handle_w) {
  print 'Couldn\'t open temporary file for writing';
  die;
}

$l = 0;

$lines = array();

while (FALSE !== ($line = fgets($handle))) {
  if ($l > 0) {
    list($date) = explode(',', $line);

    list($day, $month, $year) = explode('/', $date);

    $time = strtotime($year . '-' . $month . '-' . $day);

    $lines[$l] = $time . ',' .
      substr($line, strpos($line, ',') + 1);

  }
  else {
    $lines[$l] = $line;
  }

  fwrite($handle_w, $lines[$l]);

  $l++;
}

fclose($handle);
fclose($handle_w);

if (!rename($csv, $csv . '.old')) {
  die;
}

rename($tmp, $csv);
