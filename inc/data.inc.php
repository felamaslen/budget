<?php

function get_data_overview_query_params($category, $year_months) {
  global $user;

  $params = array();

  $union = array_slice($year_months, 1);

  $query_txt = 'SELECT SUM(cost) AS month_cost FROM (
    SELECT %d AS y, %d AS m' .
    array_reduce($union, function($red, $item) {
      return $red . "\n" . 'UNION SELECT %d, %d';
    }) .
    ') AS dates
    LEFT JOIN `{%s}` AS list
    ON uid = %d AND ((list.year = dates.y AND list.month = dates.m))
    GROUP BY y, m
  ';

  $params[0] = $query_txt;

  foreach ($year_months as $year_month) {
    $params[] = $year_month[0];
    $params[] = $year_month[1];
  }

  $params[] = $category;

  $params[] = $user->uid;

  return $params;
}

function get_balance($year_months) {
  global $user;

  $ym1 = $year_months[0];
  $ym2 = $year_months[count($year_months) - 1];

  $y1 = $ym1[0];
  $y2 = $ym2[0];

  $m1 = $ym1[1];
  $m2 = $ym2[1];

  $query = db_query('
    SELECT year, month, balance FROM {balance}
    WHERE uid = %d AND (
      (year > %d OR (year = %d AND month >= %d)) AND
      (year < %d OR (year = %d AND month <= %d))
    ) ORDER BY year, month
  ', $user->uid, $y1, $y1, $m1, $y2, $y2, $m2);

  $balance = array();

  while (NULL !== ($row = $query->fetch_object())) {
    $year = (int)$row->year;
    $month = (int)$row->month;

    $key = 12 * ($year - $y1) + $month - $m1;

    while (count($balance) < $key) {
      $balance[] = 0;
    }

    $balance[$key] = (int)$row->balance;
  }

  $padding = 12 * ($y2 - $y1) + $m2 - $m1 + 1 - count($balance);

  for ($i = 0; $i < $padding; $i++) {
    $balance[] = 0;
  }

  return $balance;
}

function get_year_months($num_last, $future_months) {
  if (isset($_GET['num_last']) && is_numeric($_GET['num_last']) &&
    $_GET['num_last'] > 0
  ) {
    $num_last = (int)($_GET['num_last']);
  }

  $start_month = (CURRENT_MONTH - $num_last + 11) % 12 + 1;
  $start_year = (int)(
    CURRENT_YEAR - ceil(max(0, ($num_last - CURRENT_MONTH + 1) / 12))
  );

  list($start_year_min, $start_month_min) = explode('-', START_DATE);

  if ($start_year < $start_year_min || (
    $start_year == $start_year_min && $start_month < $start_month_min
  )) {
    $start_year = (int)$start_year_min;
    $start_month = (int)$start_month_min;
  }

  $end_month  = (CURRENT_MONTH + $future_months - 1) % 12 + 1;
  $end_year   = (int)(
    CURRENT_YEAR + ceil(($future_months - 12 + CURRENT_MONTH) / 12)
  );
  
  $year_months = array();

  for (
    $year = $start_year, $month = $start_month; 1; $month++
  ) {
    if ($month > 12) {
      $year++;
      $month -= 12;
    }
    
    $year_months[] = array($year, $month);

    if ($year === $end_year && $month === $end_month) {
      break;
    }
  }

  return $year_months;
}

function get_total_cost($column) {
  global $user;

  return (int)(
    db_query(
      'SELECT SUM(cost) AS total FROM `{%s}` WHERE uid = %d', $column, $user->uid
    )->fetch_object()->total
  );
}

function get_data_overview(
  $past_months = DEFAULT_NUM_LAST, $future_months = FUTURE_MONTHS
) {
  global $user;

  $year_months = get_year_months($past_months, $future_months);
  
  $categories = array(
    'funds',
    'in',
    'bills',
    'food',
    'general',
    'holiday',
    'social',
  );

  $balance = get_balance($year_months);

  $queries = array_map(function($category) use ($year_months) {
    return get_data_overview_query_params($category, $year_months);
  }, $categories);

  $month_cost = array();

  foreach ($categories as $key => $category) {
    $cost = array();

    $result = call_user_func_array('db_query', $queries[$key]);

    if (!$result) {
      var_dump($queries[$key]);

      json_error(500);
    }

    while (NULL !== ($row = $result->fetch_object())) {
      $cost[] = (int)$row->month_cost;
    }

    $month_cost[$category] = $cost;
  }

  $month_cost['balance'] = $balance;

  return array(
    'cost'            => $month_cost,
    'startYearMonth'  => $year_months[0],
    'endYearMonth'    => $year_months[count($year_months) - 1],
    'currentYear'     => CURRENT_YEAR,
    'currentMonth'    => CURRENT_MONTH,
    'futureMonths'    => $future_months,
  );
}

function get_data($table, $offset = 0) {
  global $user;

  if ($table === 'overview') {
    return get_data_overview();
  }

  $table_cols = array(
    'funds' => array(
      'u' => 'units',
    ),
    'in'    => array(
    ),
    'bills' => array(
    ),
    'food'  => array(
      'k' => 'category',
      's' => 'shop',
    ),
    'general' => array(
      'k' => 'category',
      's' => 'shop',
    ),
    'holiday' => array(
      'h' => 'holiday',
      's' => 'shop',
    ),
    'social'  => array(
      'y' => 'society',
      's' => 'shop',
    ),
  );

  if (!array_key_exists($table, $table_cols)) {
    json_error(400);
  }
  
  $limit_cols = array(
    'food'    => 1,
    'general' => 5,
    'bills'   => 24,
  );

  $args = array();

  $cols = array(
    'I'   => 'id',
    'dy'  => 'year',
    'dm'  => 'month',
    'dd'  => 'date',
    'i'   => 'item',
    'c'   => 'cost'
  );

  foreach ($table_cols[$table] as $key => $col) {
    $cols[$key] = $col;
  }

  $query_txt = 'SELECT ' . implode(', ', $cols) . ' FROM `{%s}` WHERE uid = %d';

  $args[] = $table;

  $args[] = $user->uid;

  $older_exists = NULL;

  if (array_key_exists($table, $limit_cols)) {

    $num_months_view = $limit_cols[$table];

    $first_month = (
      CURRENT_MONTH - ($offset + 1) * $num_months_view - 12
    ) % 12 + 12;

    $first_year = CURRENT_YEAR - ceil(
      (($offset + 1) * $num_months_view - CURRENT_MONTH + 1) / 12
    );

    $query_txt .= ' AND ((year > %d OR (year = %d AND month >= %d))';
    
    $args[] = $first_year;
    $args[] = $first_year;
    $args[] = $first_month;

    if ($offset > 0) { 
      $last_month = ($first_month + $num_months_view - 24) % 12 + 12;

      $last_year = $first_year + ceil(
        ($num_months_view - 12 + $first_month) / 12
      );

      $query_txt .= ' AND (year < %d OR (year = %d AND month < %d))';

      $args[] = $last_year;
      $args[] = $last_year;
      $args[] = $last_month;
    }

    $query_txt .= ')';

    $older_exists_query = db_query('
      SELECT COUNT(*) AS count FROM {`%s`}
      WHERE uid = %d AND (year < %d OR (year = %d AND month < %d))
      ', $table, $user->uid, $first_year, $first_year, $first_month
    );
    
    $older_exists = $older_exists_query->fetch_object()->count > 0;
  }

  $query_txt .= ' ORDER BY year DESC, month DESC, date DESC, id DESC';

  array_unshift($args, $query_txt);

  $query = call_user_func_array('db_query', $args);

  if (!$query) {
    json_error(500);
  }

  $data = array();

  unset($cols['dy']);
  unset($cols['dm']);
  unset($cols['dd']);

  while (NULL !== ($row = $query->fetch_object())) {
    $year   = (int)$row->year;
    $month  = (int)$row->month;
    $date   = (int)$row->date;

    $datum = array(
      'd' => array((int)$year, (int)$month, (int)$date),
    );

    foreach ($cols as $key => $col) {
      $datum[$key] = $key === 'c' ? (int)($row->$col) : $row->$col;
    }

    $data[] = $datum;
  }

  $total = get_total_cost($table);

  return array(
    'data'  => $data,
    'total' => $total,
    'older' => $older_exists,
  );
}

function fy($year, $month) {
  // returns the financial year of a year/month combo
  return $month < 5 ? $year - 1 : $year;
}

function get_rpi($year) {
  // TODO: get real RPI from somewhere
  return 0.9; // this was RPI for 2015/16
}

function get_student_loan_data() {
  global $user;

  list($course_start_year,  $course_start_month)  = explode('-', LOAN_COURSE_START);
  list($course_end_year,    $course_end_month)    = explode('-', LOAN_COURSE_END);

  $num_course_years = $course_end_year - $course_start_year;

  $course_start_fy  = fy($course_start_year, $course_start_month);
  $course_end_fy    = fy($course_end_year, $course_end_month);

  $year_zeroes = array_fill(
    $course_start_year, $num_course_years, 0
  );

  $yearly_maintenance_debt_before_interest = $year_zeroes;
  
  $yearly_study_debt_before_interest = array_fill(
    $course_start_year, $num_course_years, LOAN_STUDY_PER_YEAR * 100
  );

  $query_maintenance_debt = db_query(
    'SELECT year, month, cost AS debt FROM {`in`} WHERE uid = %d AND (
      item = "Loan" AND
      (year > %d OR (year = %d AND month >= %d)) AND
      (year < %d OR (year = %d AND month <= %d))
    )
    ',
    $user->uid,
    $course_start_year, $course_start_year, $course_start_month,
    $course_end_year, $course_end_year, $course_end_month
  );

  if (!$query_maintenance_debt) { http_error(500); }

  while (NULL !== ($row = $query_maintenance_debt->fetch_object())) {
    $year = (int)$row->year;
    $month = (int)$row->month;

    $fy = fy($year, $month);

    $debt = (int)$row->debt;

    $yearly_maintenance_debt_before_interest[$fy] += $debt;
  }

  $yearly_debt_before_interest = array();

  foreach ($yearly_maintenance_debt_before_interest as $year => $debt) {
    $yearly_debt_before_interest[$year] = $debt
      + $yearly_study_debt_before_interest[$year];
  }

  // calculate cumulative debt with interest
  $debt_cum = array();

  $debt_accumulator = 0;

  foreach ($yearly_debt_before_interest as $year => $debt) {
    $this_debt_after_interest = round(
      $debt * (1 + (LOAN_INTEREST + get_rpi($year)) / 100)
    );

    $debt_accumulator += $this_debt_after_interest;

    $debt_cum[$year] = $debt_accumulator;
  }

  $current_fy = fy(CURRENT_YEAR, CURRENT_MONTH);

  for ($year = $course_end_fy + 1; $year <= $current_fy; $year++) {
    $debt_cum[$year] = $debt_cum[$course_end_fy];
  }

  if (!isset($debt_cum[$current_fy])) {
    return NULL;
  }

  $current_debt = $debt_cum[$current_fy];

  $salary = LOAN_ESTIMATED_SALARY_BEFORE_TAX; // TODO: base this on real data
  
  // work out monthly repayment according to government rules
  $monthly_repayment = floor(max(0, ($salary - 21000)) * .09 / 12) * 100;
  
  $repayment = $current_fy > $course_end_fy ? $monthly_repayment : -1;

  // forecast when we'll pay off the debt
  $interest = rpi($course_end_fy) + (
    (min(41000, max(21000, $salary)) - 21000) / (41000 - 21000)
  ) * LOAN_INTEREST / 12;

//  D1 = ((D0 - R * (1 + I)

//  $forecast_fy = 

  $data = array(
    'current' => $current_debt,
    'repay'   => $repayment,
  );

  print_r($data);
}

class FundScraper {
  public $fund_preg = '/^(.*)\s\((accum|inc)\.?\)$/';

  public $fund_sell_price = array(
    'hl' => array(),
  );

  public $did_scrape = FALSE;

  public $cache_only = FALSE;
  public $force_scrape = FALSE;

  public $cache = array();

  public function __construct($data) {
    $cache_query = db_query(
      'SELECT broker, fund_hash, sell_price FROM {fund_info}
      WHERE cache_time > %d',
      time() - 86400
    );

    if (!$cache_query) {
      json_error(500);
    }

    while (NULL !== ($row = $cache_query->fetch_object())) {
      if (!isset($this->cache[$row->broker])) {
        $this->cache[$row->broker] = array();
      }

      $this->cache[$row->broker][$row->fund_hash] = (double)$row->sell_price;
    }

    $this->data = $data;
  }

  public function scrape() {
    $this->total = count($this->data);

    array_walk($this->data, array($this, 'map_current_cost'));

    return $this->data;
  }

  function hash($fund) {
    return hash_hmac('md5', $fund, 'a963anx2', FALSE);
  }

  function get_url_hl($fund) {
    // e.g.: http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation 
    
    preg_match_all($this->fund_preg, $fund, $matches);

    $rName = $matches[1][0];

    $rType = $matches[2][0];

    $rName = strtolower($rName);
    $rName = str_replace(' ', '-', $rName);

    $name = $rName;

    $rType = strtolower($rType);

    switch ($rType) {
    case 'inc':
      $rType = 'income';
    case 'income':
    case 'accumulation':
      break;
    case 'accum':
    default:
      $rType = 'accumulation';
    }
    
    $type = $rType;

    $first_letter = substr($name, 0, 1);

    $base_url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/' .
      $first_letter . '/' . $name . '-' . $type;

    return $base_url;
  }

  function download_url($url, $i, $total) {
    $this->did_scrape = TRUE;

    if (defined('CLI_VERBOSE') && CLI_VERBOSE) {
      printf("[%d/%d] %s...\n", $i, $total, $url);
    }

    return file_get_contents($url);
  }

  function process_data($data, $hash) {
    // remove new lines
    $data = str_replace(array("\n", "\r"), '', $data);

    $preg_parts = array(
      array('<div id="security-price">', TRUE),
      array('.*', FALSE),
      array('<div>', TRUE),
      array('\s*', FALSE),
      array('<span class="price-label">Sell:</span><span class="bid', TRUE),
      array('[^>]+>', FALSE),
      array('([0-9]+(\.[0-9]*)?)p\s*', FALSE),
      array('</span>', TRUE)
    );

    $preg = '/' . implode('', array_map(function($item) {
      return $item[1] ? preg_quote($item[0], '/') : $item[0];
    }, $preg_parts)) . '/';

    $data = str_replace(',', '', $data);

    preg_match_all($preg, $data, $matches);

    if (empty($matches[1])) {
      $price = 'NULL';
      $return = NULL;
    }
    else {
      $price = (double)$matches[1][0];
      $return = $price;
    }

    if (defined('CLI_VERBOSE') && CLI_VERBOSE) {
      printf("Price: %f\n", $price);
    }


    // cache this value so we don't need to do it again until tomorrow
    db_query(
      'INSERT INTO {fund_info} (broker, fund_hash, cache_time, sell_price)
      VALUES("hl", "%s", %d, %f)
      ON DUPLICATE KEY UPDATE
      cache_time=VALUES(cache_time), sell_price=VALUES(sell_price)',
      $hash, time(), $price
    );

    return $return;
  }

  function get_current_sell_price_hl($fund, $i, $total) {
    $hash = $this->hash($fund);

    if (isset($this->fund_sell_price['hl'][$hash])) {
      return $this->fund_sell_price['hl'][$hash];
    }

    if (
      !$this->force_scrape &&
      isset($this->cache['hl']) && isset($this->cache['hl'][$hash])
    ) {
      return $this->cache['hl'][$hash];
    }

    if ($this->cache_only) {
      return NULL;
    }

    $url = $this->get_url_hl($fund);

    $data = $this->download_url($url, $i, $total);

    $price = $this->process_data($data, $hash);

    return $price;
  }

  function map_current_cost(&$item, $i) {
    // price per unit
    $item['P'] = null;

    $fund = $item['i'];

    if (!preg_match($this->fund_preg, $fund)) {
      // wrong item format
      return;
    }
    
    $units = $item['u'];

    if (empty($units) || !is_numeric($units)) {
      $units = 0;
    }

    $units = (double)$units;

    $sell_price = $this->get_current_sell_price_hl(
      $fund, $i, $this->total
    );

    if (is_null($sell_price)) {
      // for some reason the scrape failed
      return;
    }

    $item['P'] = $sell_price;
  }
}

