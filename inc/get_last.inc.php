<?php

function get_last_items($table, $fields, $number, $offset) {
  $query = db_query('
    SELECT * FROM (
      SELECT id, date, %s FROM {%s}
      ORDER BY date DESC
      LIMIT %d, %d
    ) results ORDER BY date ASC
  ', implode(', ', array_keys($fields)), $table, $offset, $number);

  $items = array();

  while (NULL !== ($row = $query->fetch_array())) {
    $id = (int)($row->id);

    $items[$id] = array(
      'date' => (int)($row['date']),
    );

    foreach ($fields as $field => $type) {
      switch ($type) {
      case 'int':
        $items[$id][$field] = (int)($row[$field]);
        break;
      default:
        $items[$id][$field] = $row[$field];
      }
    }
  }

  return $items;
}

function get_last_food($number = DEFAULT_NUM_LAST, $offset = 0) {
  return get_last_items('food', array(
    'item'      => 'string',
    'category'  => 'string',
    'cost'      => 'int',
    'shop'      => 'string',
  ), $number, $offset);
}

function get_last_general($number = DEFAULT_NUM_LAST, $offset = 0) {
  return get_last_items('general', array(
    'item'      => 'string',
    'category'  => 'string',
    'cost'      => 'int',
    'shop'      => 'string',
  ), $number, $offset);
}

function get_last_holiday($number = DEFAULT_NUM_LAST, $offset = 0) {
  return get_last_items('general', array(
    'item'    => 'string',
    'holiday' => 'string',
    'cost'    => 'int',
    'shop'    => 'string',
  ), $number, $offset);
}

function get_last_housing($number = DEFAULT_NUM_LAST, $offset = 0) {
  return get_last_items('housing', array(
    'type' => 'string',
    'cost' => 'int',
  ), $number, $offset);
}

function get_last_social($number = DEFAULT_NUM_LAST, $offset = 0) {
  return get_last_items('housing', array(
    'item'    => 'string',
    'society' => 'string',
    'cost'    => 'int',
    'shop'    => 'string',
  ), $number, $offset);
}

function get_last_in($number = DEFAULT_NUM_LAST, $offset = 0) {
  return get_last_items('in', array(
    'item'    => 'string',
    'amount'  => 'int',
  ), $number, $offset);
}

