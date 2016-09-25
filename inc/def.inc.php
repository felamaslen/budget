<?php

define('DEFAULT_NUM_LAST', 25);
define('START_DATE', '2014-09');

list($year, $month, $date) = explode('-', date('Y-m-d'));
define('CURRENT_YEAR',  (int)$year);
define('CURRENT_MONTH', (int)$month);
define('CURRENT_DATE',  (int)$date);

define('DATE_SERIALISED', '/^[0-9]{4},[0-9]{1,2},[0-9]{1,2}$/');

define('FUTURE_MONTHS', 10);

define('PIE_TOLERANCE', 0.075); // measured in radians

define('LOAN_COURSE_START', '2014-09');
define('LOAN_COURSE_END',   '2017-04');
define('LOAN_STUDY_PER_YEAR', 6500); // with bursary
define('LOAN_INTEREST', 3);
define('LOAN_ESTIMATED_SALARY_BEFORE_TAX', 25000);

$serial_file = BASE_DIR . '/serial';

$serial = file_exists($serial_file)
  ? trim(file_get_contents($serial_file))
  : date('Ymd') . '1';

define('CACHE_SERIAL', $serial);
