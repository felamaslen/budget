<?php

/**
 * provides a REST api for the app
 *
 * this one is absolute cunt and will be rewritten in python,
 * at some point
 */

require_once dirname(__FILE__) . '/inc/common.php';

require_once BASE_DIR . '/inc/user.rest.php';

class RestApi {
  public function __construct($user) {
    $this->res = array('error' => FALSE);

    if (!$this->validate_args()) { 
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Must supply API method';
    }
    else {
      $this->user = $user;
      
      $this->table_cols = array(
        'funds' => array('item' => '"%s"', 'units' => '"%s"', 'cost' => '%d'),
        'in'    => array('item' => '"%s"', 'cost' => '%d'),
        'bills' => array('item' => '"%s"', 'cost' => '%d'),
        'food'  => array(
          'item' => '"%s"', 'category' => '"%s"', 'cost' => '%d', 'shop' => '"%s"'
        ),
        'general'  => array(
          'item' => '"%s"', 'category' => '"%s"', 'cost' => '%d', 'shop' => '"%s"'
        ),
        'holiday'  => array(
          'item' => '"%s"', 'holiday' => '"%s"', 'cost' => '%d', 'shop' => '"%s"'
        ),
        'social'  => array(
          'item' => '"%s"', 'society' => '"%s"', 'cost' => '%d', 'shop' => '"%s"'
        ),
      );

      $this->execute();
    }

    print json_encode($this->res);
  }

  private function get_pie($table = NULL) {
    if (is_null($table)) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Must supply table!';

      return;
    }

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
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Must supply valid table!';

      return;
    }

    $pieTemplates = array(
      'cost' => array(
        'query' => function($col, $table, $limit) {
          return array(
            'SELECT `%s` AS col, SUM(cost) AS cost FROM {`%s`}
            WHERE uid = %d AND cost > 0
            GROUP BY %s
            ORDER BY cost DESC
            LIMIT %d',
            $col,
            $table,
            $this->user->uid,
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
              SELECT `%s` AS col
              FROM {`%s`}
              WHERE uid = %d
              GROUP BY year, month, date, col
            ) results
            GROUP BY col
            ORDER BY cost DESC
            LIMIT %d',
            $col,
            $table,
            $this->user->uid,
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
        json_error(500);
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

      if ($total > 0) {
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
      }

      $pie_data = array_values($pie_data);

      $data[] = array(
        'title' => $pieTitle,
        'type'  => $pieTemplate,
        'data'  => $pie_data,
        'total' => $total,
      );
    }

    $this->res['data'] = $data;
  }

  private function get_data_stocks() {
    $result = db_query('
      SELECT code, name, SUM(weight * subweight) AS weight FROM {stocks}
      GROUP BY code
      ORDER BY weight DESC
      ');

    if (!$result) {
      json_error(500);
    }

    $stocks = array();

    $total_weight = 0;

    while (NULL !== ($row = $result->fetch_object())) {
      $this_weight = (double)$row->weight;

      $total_weight += $this_weight;

      $stocks[$row->code] = array(
        'n' => $row->name,
        'w' => $this_weight
      );
    }

    $this->res['data']['stocks'] = $stocks;

    $this->res['data']['total'] = $total_weight;
  }
  
  private function get_data_funds($offset = 0) {
    $this->res['data'] = get_data('funds', $offset);

    $scraper = new FundScraper($this->res['data']['data']);

    $scraper->cache_only = TRUE;

    $this->res['data']['data'] = $scraper->scrape();

    $this->res['data']['from_cache'] = !$scraper->did_scrape;
  }

  private function get_fund_value_history() {
    $query = db_query(
      'SELECT c.time, SUM(fc.price * f.units) AS value
      FROM {funds} f
      INNER JOIN {fund_cache} fc ON fc.did = f.id
      INNER JOIN {fund_cache_time} c ON c.done = 1 AND c.cid = fc.cid
      WHERE f.uid = %d
      GROUP BY fc.cid
      ORDER BY c.time ASC', $this->user->uid
    );

    if (!$query) {
      json_error(500);
    }

    $results = array();

    $start_time = NULL;

    $total_time = 0;

    $max_value = 0;

    while (NULL !== ($row = $query->fetch_object())) {
      $time = (int)$row->time;
      $value = round($row->value);

      if (is_null($start_time)) {
        $start_time = $time;
      }

      $results[] = array(
        $time - $start_time,
        $value
      );

      $total_time = $time - $start_time;

      if ($value > $max_value) {
        $max_value = $value;
      }
    }

    $this->res['data'] = array(
      'history' => $results,
      'totalTime' => $total_time,
      'maxValue'  => $max_value,
    );
  }

  private function get_data_all() {
    $this->res['data'] = array();

    $cols = array(
      'overview', 'funds', 'in', 'bills', 'food', 'general', 'holiday', 'social'
    );

    $overview = get_data('overview', 0);

    foreach ($cols as $col) {
      $_res = get_data($col, 0);

      $this->res['data'][$col] = $_res;
    }
  }

  private function get_data($table, $offset = 0) {
    $this->res['data'] = get_data($table, (int)$offset);
  }

  private function get_data_search($table, $column, $term, $max) {
    if (is_null($table) || is_null($column) || is_null($term)) {
      json_error(400);
    }

    if (!isset($this->table_cols[$table]) || !isset($this->table_cols[$table][$column])) {
      json_error(400);
    }

    $colType = $this->table_cols[$table][$column];

    if ($colType !== '"%s"') {
      json_error(400);
    }

    if (is_null($max) || !is_numeric($max)) {
      $max = 1;
    }

    $query = db_query(
      'SELECT `%s` AS `col`, SUM(IF(`%s` LIKE "%s%", 1, 0)) AS matches
      FROM `%s`
      WHERE uid = %d AND `%s` LIKE "%%%s%%"
      GROUP BY `col`
      ORDER BY matches DESC
      LIMIT %d
      ', $column, $column, $term, $table, $this->user->uid, $column, $term, $max);

    if (!$query) {
      json_error(500);
    }

    $this->res['data'] = array();

    if ($query->num_rows > 0) {
      while (NULL !== ($row = $query->fetch_object())) {
        $this->res['data'][] = $row->col;
      }
    }
  }

  private function post_update_overview() {
    if (
      !isset($_POST['balance']) || !is_numeric($_POST['balance']) ||
      !isset($_POST['year']) || !isset($_POST['month'])
    ) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Must supply valid data!';

      return;
    }

    $exists = db_query(
      'SELECT uid
      FROM {balance}
      WHERE uid = %d AND year = %d AND month = %d',
      $this->user->uid, $_POST['year'], $_POST['month']
    )->num_rows > 0;

    if ($exists) {
      $query = db_query(
        'UPDATE {balance} SET balance = %d
        WHERE uid = %d AND year = %d AND month = %d',
        $_POST['balance'], $this->user->uid, $_POST['year'], $_POST['month']
      );
    }
    else {
      $query = db_query(
        'INSERT INTO {balance} (uid, year, month, balance) VALUES (%d, %d, %d, %d)',
        $this->user->uid, $_POST['year'], $_POST['month'], $_POST['balance']
      );
    }

    if (!$query) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Database error';
    }
  }

  private function post_update($table) {
    if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Must supply valid ID!';

      return;
    }

    $qArgs = array();
    $qTxt = 'UPDATE {`' . $table . '`} SET';

    $cols = $this->table_cols[$table];

    $cols_defined = 0;
    
    if (isset($_POST['date'])) {
      $cols_defined++;
    
      $date = deserialise_date($_POST['date']);

      if (is_null($date)) {
        $this->res['error'] = TRUE;
        $this->res['errorText'] = 'Must supply valid date!';

        return;
      }

      $qTxt .= ' year = %d, month = %d, date = %d';

      $qArgs[] = $date['year'];
      $qArgs[] = $date['month'];
      $qArgs[] = $date['date'];
    }

    foreach ($cols as $col => $type) {
      if (isset($_POST[$col])) {
        $comma = $cols_defined++ ? ',' : '';

        $qTxt .= $comma . ' ' . $col . ' = ' . $type;

        $qArgs[] = $_POST[$col];
      }
    }

    if ($cols_defined === 0) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Must enter some data!';

      return;
    }

    $qTxt .= ' WHERE uid = %d AND id = %d';

    $qArgs[] = $this->user->uid;
    $qArgs[] = $_POST['id'];

    array_unshift($qArgs, $qTxt);

    $query = call_user_func_array('db_query', $qArgs);

    if (!$query) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Database error';
    }
    else {
      $this->res['total'] = get_total_cost($table);
    }
  }

  private function post_add($table) {
    $cols = $this->table_cols[$table];

    $cols_defined = TRUE;

    foreach ($cols as $col => $type) {
      if (!isset($_POST[$col])) {
        $cols_defined = FALSE;

        break;
      }
    }

    if (
      !$cols_defined || !isset($_POST['date']) ||
      !preg_match(DATE_SERIALISED, $_POST['date'])
    ) {
      json_error(400);
    }

    $date = deserialise_date($_POST['date']);

    $qArgs = array();

    $qTxt = 'INSERT INTO {`' . $table . '`} (uid, year, month, date, ' .
      implode(', ', array_keys($cols)) .
      ') VALUES (%d, %d, %d, %d, ' . implode(', ', $cols) . ')';

    $qArgs[] = $this->user->uid;

    $qArgs[] = $date['year'];
    $qArgs[] = $date['month'];
    $qArgs[] = $date['date'];

    foreach ($cols as $col => $type) {
      $qArgs[] = $_POST[$col];
    }

    array_unshift($qArgs, $qTxt);

    $query = call_user_func_array('db_query', $qArgs);

    if (!$query) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Database error';
    }
    else {
      $this->res['total'] = get_total_cost($table);
      $this->res['id'] = db_insert_id();
    }
  }

  private function post_delete($table) {
    if (!isset($_POST['id'])) {
      json_error(400);
    }

    $query = db_query(
      'DELETE FROM ' . $table . ' WHERE uid = %d AND id = %d', $this->user->uid, $_POST['id']
    );
    
    if (!$query) {
      $this->res['error'] = TRUE;
      $this->res['errorText'] = 'Database error';
    }
  }

  private function validate_args() {
    if (!isset($_GET['t'])) {
      return FALSE;
    }

    $this->args = explode('/', $_GET['t']);

    return TRUE;
  }

  private function get_login() {
    // check if this IP has tried to log in before in the past 5 seconds
    $num_seconds_penalty = 60;

    $num_tries = 10;

    $ip = $_SERVER['REMOTE_ADDR'];

    $ip_check_query = db_query(
      'SELECT `time`, `count` FROM {ip_login_req} WHERE `ip` = "%s"', $ip
    );

    $ip_check_exists = FALSE;
    $ip_check_count = 0;

    if ($ip_check_query->num_rows > 0) {
      $ip_check_exists = TRUE;

      $obj = $ip_check_query->fetch_object();

      $time = (int)($obj->time);
      $ip_check_count = (int)($obj->count);

      $breach = FALSE;
      
      if ($ip_check_count >= $num_tries) {
        $since = time() - $time;

        if ($since < 1) {
          // fuck that!
          json_error(401);
        }
        else if ($since < $num_seconds_penalty) {
          $breach = TRUE;
        }
        else {
          // user has honoured the penalty
          $ip_check_count = 0;
        }
      }

      if ($breach) {
        db_query(
          'UPDATE {ip_login_req} SET `time` = %d, `count` = %d WHERE ip = "%s"',
          time(), $num_tries, $ip
        );
        
        json_error(401);
      }
    }

    $this->user->login();

    if ($this->user->uid > 0) {
      // logged in
      $this->res['uid']     = $this->user->uid;
      $this->res['name']    = $this->user->name;
      $this->res['api_key'] = $this->user->api_key;
    }
    else {
      // bad login
      $this->res['error'] = TRUE;

      $this->res['errorText'] = $this->user->pin ? 'Bad PIN' : 'No PIN';

      if ($ip_check_exists) {
        db_query(
          'UPDATE {ip_login_req} SET `time` = %d, `count` = %d WHERE ip = "%s"',
          time(), $ip_check_count + 1, $ip
        );
      }
      else {
        db_query(
          'INSERT INTO {ip_login_req} (`ip`, `time`, `count`) VALUES("%s", %d, %d)',
          $ip, time(), 1
        );
      }
    }
  }

  private function execute() {
    $arg = array_shift($this->args);

    if ($arg === 'login') {
      $this->get_login();
    }
    else {
      $this->user->auth();

      if (!$this->user->uid) {
        $this->res['error'] = TRUE;

        $this->res['errorText'] = isset($_SERVER['HTTP_AUTHORIZATION'])
          ? 'Bad authentication token'
          : 'Not authenticated';
      }
      else {
        $method = strtolower($_SERVER['REQUEST_METHOD']);

        switch ($method) {
        case 'get':
          switch ($arg) {
          case 'data':
            $type = array_shift($this->args);

            $arg3 = array_shift($this->args);

            switch ($type) {
            case 'stocks':
              $this->get_data_stocks();
              break;

            case 'search':
              $table = $arg3;

              $column = array_shift($this->args);

              $term = array_shift($this->args);

              $max = array_shift($this->args);

              $this->get_data_search($table, $column, $term, $max);
              break;
            
            case 'funds':
              $this->get_data_funds();
              break;

            case 'fund_history':
              $this->get_fund_value_history();
              break;

            case 'overview':
            case 'in':
            case 'bills':
            case 'food':
            case 'general':
            case 'holiday':
            case 'social':
              $offset = $arg3;

              if (is_null($offset)) {
                $offset = 0;
              }

              $this->get_data($type, $offset);
              break;

            case 'all':
            default:
              $this->get_data_all();
            }

            break;
          
          case 'pie':
            $table = array_shift($this->args);

            $this->get_pie($table);

            break;

          default:
            json_error(400);
          }

          break;
        
        case 'post':
          $arg2 = array_shift($this->args);

          switch ($arg) {
          case 'update':
            switch ($arg2) {
            case 'overview':
              $this->post_update_overview();
              break;

            default:
              $this->post_update($arg2);
              break;
            }

            break;

          case 'add':
            $this->post_add($arg2);

            break;

          case 'delete':
            $this->post_delete($arg2);

            break;

          default:
            json_error(400);
          }

          break;

        default:
          json_error(400);
        }
      }
    }
  }
}

$api = new RestApi($user);

