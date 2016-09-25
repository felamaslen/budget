<?php

/* database stuff */

require_once BASE_DIR . '/inc/db.password.inc.php';

$database = array(
  'hostname'  => 'localhost',
  'username'  => DB_USERNAME,
  'password'  => DB_PASSWORD,
  'database'  => 'budget',
  'db_prefix' => '',
);

$db = new mysqli(
  $database['hostname'],
  $database['username'],
  $database['password'],
  $database['database']
);

if ($db->connect_errno) {
  json_error(500);
}

$db->set_charset('utf8');

define('DB_QUERY_REGEXP', '/(%d|%s|%%|%f|%b|%n)/');

$queries = array();

$vars = array(
  'debug_query' => isset($_GET['debug_query']),
);

function var_get($name, $default = NULL) {
  global $vars;

  if (isset($vars[$name])) {
    return $vars[$name];
  }

  $query = db_query('SELECT {value}
    FROM {vars}
    WHERE {name} = "%s"', $name);

  print 'var_get: ';
  var_dump($query);;

  return $default;
}

function db_affected_rows() {
  global $db;
  return $db->affected_rows;
}
function db_select_db($name = NULL) {
  global $db, $database;
  $db->select_db(is_null($name) ? $database['database'] : $name);
}
function db_insert_id() {
  global $db;
  return $db->insert_id;
}
function db_query($query) {
  $args = func_get_args();
  array_shift($args);
  $query = db_prefix_tables($query);
  if (isset($args[0]) and is_array($args[0])) { // 'All arguments in one array' syntax
    $args = $args[0];
  }
  _db_query_callback($args, TRUE);
  
  $query = preg_replace_callback(DB_QUERY_REGEXP, '_db_query_callback', $query);

  return _db_query($query, var_get('debug_query', 0));
}

function _db_query($query, $debug = 0) {
  global $db, $queries, $user;

  if (var_get('debug_query', 0)) {
    list($usec, $sec) = explode(' ', microtime());
    $timer = (float)$usec + (float)$sec;
    // If devel.module query logging is enabled, prepend a comment with the username and calling function
    // to the SQL string. This is useful when running mysql's SHOW PROCESSLIST to learn what exact
    // code is issueing the slow query.
    $bt = debug_backtrace();
    // t() may not be available yet so we don't wrap 'Anonymous'.
    $query = '/* '. $bt[2]['function'] .' */ '. $query;
  }

  $result = $db->query($query);

  if (var_get('debug_query', 0)) {
    $query = $bt[2]['function'] ."\n". $query;
    list($usec, $sec) = explode(' ', microtime());
    $stop = (float)$usec + (float)$sec;
    $diff = $stop - $timer;
    $queries[] = array($query, $diff);
  }

  if ($debug)
    print '<p>query: '. $query .'<br />error:'. $db->error .'</p>';

  if (!$db->errno) {
    return $result;
  }
  else {
    return FALSE;
  }
}

function _db_query_callback($match, $init = FALSE) {
  static $args = NULL;
  if ($init) {
    $args = $match;
    return;
  }

  if (is_null($match[1])) return 'null';

  switch ($match[1]) {
    case '%d': // We must use type casting to int to convert FALSE/NULL/(TRUE?)
      $value = array_shift($args);
      // Do we need special bigint handling?
      if ($value > PHP_INT_MAX) {
        $precision = ini_get('precision');
        @ini_set('precision', 16);
        $value = sprintf('%.0f', $value);
        @ini_set('precision', $precision);
      }
      else {
        $value = (int) $value;
      }
      // We don't need db_escape_string as numbers are db-safe.
      return $value;
    case '%s':
      return db_escape_string(array_shift($args));
    case '%n':
      // Numeric values have arbitrary precision, so can't be treated as float.
      // is_numeric() allows hex values (0xFF), but they are not valid.
      $value = trim(array_shift($args));
      return is_numeric($value) && !preg_match('/x/i', $value) ? $value : '0';
    case '%%':
      return '%';
    case '%f':
      return (float) array_shift($args);
    case '%b': // binary data
      return db_encode_blob(array_shift($args));
  }
}

function db_escape_string($string) {
  global $db;
  return $db->real_escape_string($string);
}

function db_encode_blob($string) {
  return '%b';
}

function db_prefix_tables($sql) {
  global $database;

  return strtr($sql, array('{' => $database['db_prefix'], '}' => ''));
}
