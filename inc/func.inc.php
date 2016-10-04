<?php

function serialise_date($year, $month, $date) {
  return $year . ',' . $month . ',' . $date;
}

function deserialise_date($string) {
  if (!preg_match(DATE_SERIALISED, $string)) {
    return NULL;
  }

  list($year, $month, $date) = explode(',', $string);

  return array(
    'year' => $year,
    'month' => $month,
    'date' => $date,
  );
}

function time_from_date($year = CURRENT_YEAR, $month = CURRENT_MONTH, $date = CURRENT_DATE) {
  return strtotime($year . '-' . $month . '-' . $date . ' 00:00');
}

function format_currency($pence) {
  return '&pound;' . number_format($pence / 100, 2);
}

function http_error_status($code) {
  $codes = array(
    400 => 'Bad Request',
    401 => 'Access Denied',
    404 => 'Not Found',
    403 => 'Access Forbidden',
    500 => 'Internal Server Error',
    502 => 'Bad Gateway',
  );

  if (!isset($codes[$code])) {
    $code = 500;
  }

  return array(
    'header' => 'HTTP/1.1 ' . $code . ' ' . $codes[$code],
    'code' => $code,
    'msg' => $codes[$code],
  );
}

function http_error($code = 500) {
  $status = http_error_status($code);

  header($status['header']);

  print '<h1>' . $status['msg'] . '</h1>';

  die;
}

// for the REST api
function json_error($code = 500, $message = NULL) {
  $status = http_error_status($code);

  if (php_sapi_name() !== 'cli') {
    header($status['header']);
  }
  
  $res = array(
    'error' => TRUE,
    'errorText' => $status['msg'],
  );

  if ($message) {
    $res['errorMsg'] = $message;
  }

  print json_encode($res);
  
  die;
}

function validate($value, $type) {
  switch ($type) {
  case 'date':
    return $value && is_array($value) && count($value) === 3 &&
      is_numeric($value[0]) && $value[0] > 0 &&
      is_numeric($value[1]) && $value[1] > 0 && $value[1] < 13 &&
      is_numeric($value[2]) && $value[2] > 0 && $value[2] < 32;

  case 'text':
    return TRUE;//strlen($value) > 0;

  case 'number':
  case 'int':
    return is_numeric($value);
  }
}

function validate_columns($columns) {
  $error = array();

  $data = array(
    'id'  => NULL,
  );

  $num_data = 0;

  foreach ($columns as $column => $val) {
    if (isset($_POST[$column])) {
      $value = $_POST[$column];

      if (!validate($value, $val[1])) {
        $error[] = 'Bad ' . $column;
      }
      else {
        switch ($val[1]) {
        case 'date':
          $data['year']   = $value[0];
          $data['month']  = $value[1];
          $data['date']   = $value[2];

          break;
        case 'int':
          $value = (int)$value;
        default:
          $data[$column] = $value;
        }

        $num_data++;
      }
    }
  }
  
  if (isset($_POST['id'])) {
    if (!validate($_POST['id'], 'int')) {
      $error[] = 'Bad ID';
    }
    else {
      $data['id'] = (int)$_POST['id'];
    }
  }
  else if ($num_data < count($columns)) {
    $error[] = 'Not all info supplied';
  }

  if ($num_data === 0) {
    $error[] = 'No info supplied';
  }

  if (!empty($error)) {
    print '<p>Errors encountered:</p>';
    print '<ul><li>' . implode('</li><li>', $error) . '</li></ul>';

    http_error(400);
  }

  return $data;
}

function data_type($key) {
  switch ($key) {
  case 'id':
  case 'year':
  case 'month':
  case 'date':
  case 'cost':
    return '%d';
  case 'item':
  case 'category':
  case 'shop':
  default:
    return '"%s"';
  }
}

function key_val($key) {
  return $key . ' = ' . data_type($key);
}

function update_row($table, $data) {
  global $db;

  $id = $data['id'];

  unset($data['id']);
  
  $keys = array_keys($data);

  if (is_null($id)) {
    // insert a new item
    $query_txt = 'INSERT INTO {%s} (' . implode(', ', $keys) .
      ') VALUES (' . implode(', ', array_map('data_type', $keys)) . ')';

    $args = array_values($data);

    array_unshift($args, $table);

    array_unshift($args, $query_txt);
  }
  else {
    // update an existing item
    $query_txt = 'UPDATE {%s} SET ' . implode(', ', array_map('key_val', $keys)) .
      ' WHERE id = %d';

    $args = array_values($data);

    array_unshift($args, $table);

    array_unshift($args, $query_txt);

    $args[] = $id;
  }

  $query = call_user_func_array('db_query', $args);

  if (!$query) {
    print 'Database error';
    http_error(500);
  }

  if (is_null($id)) {
    $id = $db->insert_id;
  }

  print json_encode(array(
    'id'    => $id,
    'total' => get_total_cost($table),
  ));
}

