<?php

require_once dirname(__FILE__) . '/inc/common.php';

require_once BASE_DIR . 'inc/user.inc.php';

if (!$user->uid) {
  http_error(403);
}

$task = NULL;

if (isset($_GET['t'])) {
  $task = $_GET['t'];
}

switch ($task) {
case 'logout':
  $user->logout();

  print json_encode('success');

  break;

case 'login':
  print json_encode($user);

  break;

case 'loan':
  http_error(400);
  get_student_loan_data();
  break;

case 'data_overview':
  $data = get_data_overview();

  print json_encode($data);
  
  break;

case 'data':
  if (!isset($_GET['table'])) {
    print 'Must set table!';
    http_error(400);
  }

  $table = $_GET['table'];

  $columns = array('funds', 'in', 'bills', 'food', 'general', 'holiday', 'social');

  if (!in_array($table, $columns)) {
    print 'Invalid table';
    http_error(400);
  }

  $offset = 0;

  if (isset($_GET['offset']) && is_numeric($_GET['offset'])
    && $_GET['offset'] > 0
  ) {
    $offset = (int)($_GET['offset']);
  }

  $data = get_data($table, $offset);

  print json_encode($data);

  break;

case 'update_balance':
  $year = NULL;
  $month = NULL;
  $value = NULL;

  if (isset($_POST['year']) && isset($_POST['month']) && isset($_POST['value'])) {
    $year = $_POST['year'];
    $month = $_POST['month'];

    $value = $_POST['value'];
  }

  if (!is_numeric($year) || !is_numeric($month) || !is_numeric($value)) {
    http_error(400);
  }

  $query_exists = db_query('SELECT id FROM {balance}
    WHERE year = %d AND month = %d', $year, $month);

  if (!$query_exists) {
    http_error(500);
  }

  $item_exists = $query_exists->num_rows && $query_exists->num_rows > 0;

  if ($item_exists) {
    $query = db_query('UPDATE {balance} SET balance = %d
      WHERE year = %d AND month = %d
    ', $value, $year, $month);
  }
  else {
    $query = db_query('INSERT INTO {balance} (year, month, balance) VALUES(%d, %d, %d)',
      $year, $month, $value);
  }

  if (!$query) {
    http_error(500);
  }

  print json_encode('success');

  break;

case 'update':
  if (!isset($_GET['table'])) {
    print 'Must set table';
    http_error(400);
  }

  $table = $_GET['table'];

  $columns = array(
    'funds' => array(
      'date'  => array(NULL, 'date'),
      'item'  => array(NULL, 'text'),
      'cost'  => array(NULL, 'int'),
    ),
    'in' => array(
      'date'  => array(NULL, 'date'),
      'item'  => array(NULL, 'text'),
      'cost'  => array(NULL, 'int'),
    ),
    'bills' => array(
      'date'      => array(NULL, 'date'),
      'item'      => array(NULL, 'text'),
      'cost'      => array(NULL, 'int'),
    ),
    'food' => array(
      'date'      => array(NULL, 'date'),
      'item'      => array(NULL, 'text'),
      'category'  => array(NULL, 'text'),
      'cost'      => array(NULL, 'int'),
      'shop'      => array(NULL, 'text'),
    ),
    'general' => array(
      'date'      => array(NULL, 'date'),
      'item'      => array(NULL, 'text'),
      'category'  => array(NULL, 'text'),
      'cost'      => array(NULL, 'int'),
      'shop'      => array(NULL, 'text'),
    ),
    'holiday' => array(
      'date'      => array(NULL, 'date'),
      'item'      => array(NULL, 'text'),
      'holiday'   => array(NULL, 'text'),
      'cost'      => array(NULL, 'int'),
      'shop'      => array(NULL, 'text'),
    ),
    'social'  => array(
      'date'      => array(NULL, 'date'),
      'item'      => array(NULL, 'text'),
      'cost'      => array(NULL, 'int'),
      'shop'      => array(NULL, 'text'),
      'society'   => array(NULL, 'text'),
    ),
  );

  if (!isset($columns[$table])) {
    print 'Bad table';
    http_error(400);
  }

  $data = validate_columns($columns[$table]);

  update_row($table, $data);

  break;

case 'pie':
  if (!isset($_GET['table'])) {
    http_error(400);
  }

  $table = $_GET['table'];

  $col = array(
    'funds' => array(
      array('item', 'cost', 'Total'),
    ),
    'in' => array(
      array('item', 'cost', 'Total'),
    ),
    'food' => array(
      array('shop', 'cost', 'Shop cost'),
      array('category', 'cost',  'Category cost'),
    ),
    'general' => array(
      array('shop', 'cost', 'Shop cost'),
      array('category', 'cost', 'Category cost'),
    ),
    'holiday' => array(
      array('holiday', 'cost', 'Holiday cost'),
      array('holiday', 'int', 'Holiday number'),
    ),
    'social' => array(
      array('shop', 'cost', 'Shop cost'),
      array('society', 'cost', 'Society cost'),
    ),
  );

  if (!isset($col[$table])) {
    http_error(400); // bad table
  }

  $pieTemplates = array(
    'cost' => array(
      'query' => function($col, $table, $limit) {
        return array(
          'SELECT %s AS col, SUM(cost) AS cost FROM {%s}
          WHERE cost > 0
          GROUP BY %s
          ORDER BY cost DESC
          LIMIT %d',
          $col,
          $table,
          $col,
          $limit,
        );
      },
      'type'  => 'cost',
    ),
    'int' => array(
      'query' => function($col, $table, $limit) {
        return array(
          'SELECT col, COUNT(*) AS cost FROM (
            SELECT %s AS col
            FROM {%s}
            GROUP BY year, month, date, col
          ) results
          GROUP BY col
          ORDER BY cost DESC
          LIMIT %d',
          $col,
          $table,
          $limit,
        );
      },
      'type'  => 'int',
    ),
  );

  $limit = 30;

  $threshold = PIE_TOLERANCE / (2 * M_PI);

  $data = array();
  
  function sort_quant($a, $b) {
    return $a[1] < $b[1] ? 1 : -1;
  }

  foreach ($col[$table] as $chart) {
    $pieCol       = $chart[0];
    $pieTemplate  = $chart[1];
    $pieTitle     = $chart[2];

    $template = $pieTemplates[$pieTemplate];

    $query_args = $template['query']($pieCol, $table, $limit);

    $query = call_user_func_array('db_query', $query_args);

    if (!$query) {
      http_error(500);
    }

    $pie_data = array();

    $total = 0;

    while (NULL !== ($row = $query->fetch_object())) {
      $total += (int)$row->cost;

      $pie_data[] = array(
        $row->col,
        (int)$row->cost,
      );
    }

    // concatenate very small slices into a slice called "other"
    $j = count($pie_data) - 1;

    $other = 0;

    while ($pie_data[$j][1] / $total < $threshold) {
      $other += $pie_data[$j][1];

      array_pop($pie_data);
      $j--;
    }

    if ($other > 0) {
      $pie_data[] = array('Other', $other);

      uasort($pie_data, 'sort_quant');
    }

    uasort($pie_data, 'sort_quant');

    $pie_data = array_values($pie_data);

    $data[] = array(
      'title' => $pieTitle,
      'type'  => $pieTemplate,
      'data'  => $pie_data,
      'total' => $total,
    );
  }

  print json_encode($data);

  break;

default:
  http_error(400);

  die;
}

