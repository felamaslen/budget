<?php

class User {
  public function __construct() {
    $this->uid  = 0;
    $this->name = NULL;

    if (isset($_POST['pin']) && strlen($_POST['pin']) > 0) {
      if (is_array($_POST['pin'])) {
        $_POST['pin'] = implode('', $_POST['pin']);
      }

      $this->pin = $_POST['pin'];
    }
    else {
      $this->pin = NULL;
    }
  }

  public function auth() {
    // verifies the api key passed in the request header
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
      $api_key = $_SERVER['HTTP_AUTHORIZATION'];

      $query = db_query('SELECT uid, user FROM {users} WHERE api_key = "%s"', $api_key);

      if (!$query) {
        http_error(500, 1);
      }

      if ($query->num_rows > 0) {
        $result = $query->fetch_object();

        $this->uid  = (int)$result->uid;
        $this->name = $result->user;
      }
    }
  }
  
  public function login() {
    if (!is_null($this->pin)) {
      $info_query = db_query(
        'SELECT uid, user, api_key FROM {users} WHERE api_key = "%s"',
        $this->password_hash($this->pin)
      );
      
      if (!$info_query) {
        http_error(500, 1);
      }

      if ($info_query->num_rows > 0) {
        $row = $info_query->fetch_object();

        $this->uid      = (int)($row->uid);
        $this->name     = $row->user;
        $this->api_key  = $row->api_key;
      }
    }
  }

  private function password_hash($pin) {
    return sha1($pin);
  }
}

$user = new User();
