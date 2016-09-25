<?php

class User {
  public function __construct() {
    $this->uid  = NULL;
    $this->name = NULL;

    session_start();

    $this->try_login();
  }
  
  public function check_status($pin = NULL, $rememberme = FALSE) {
    // use login details if they are passed
    if ($pin) {
      $this->login_pin($pin);

      if ($rememberme) {
        setcookie('pin', $pin, time() + 30 * 86400);
      }
    }

    // check if there is a session
    if (!$this->uid && isset($_SESSION['uid'])) {
      $uid = (int)($_SESSION['uid']);

      $info_query = db_query('SELECT user FROM {users} WHERE uid = %d', $uid);

      if (!$info_query) { json_error(500); }

      if ($info_query->num_rows > 0) {
        $this->uid  = $uid;
        $this->name = $info_query->fetch_object()->user;
      }
    }

    // check if there is a cookie
    if (!$this->uid && isset($_COOKIE['pin'])) {
      $pin = (int)($_COOKIE['pin']);

      $this->login_pin($pin);
    }
  }

  public function logout() {
    if (isset($_SESSION['uid'])) {
      unset($_SESSION['uid']);
    }

    setcookie('pin', '', time() - 5000);

    $this->uid  = NULL;
    $this->name = NULL;
  }

  private function try_login() {
    $pin = NULL;
    $rememberme = FALSE;

    if (isset($_POST['pin'])) {
      if (is_array($_POST['pin'])) {
        $_POST['pin'] = implode('', $_POST['pin']);
      }

      $rememberme = isset($_POST['rememberme']) && $_POST['rememberme'] == 'yes';

      $pin = (int)($_POST['pin']);
    }

    $this->check_status($pin, $rememberme);
  }

  private function login_pin($pin) {
    $info_query = db_query(
      'SELECT uid, user FROM {users} WHERE pin = %d', $pin
    );
    
    if (!$info_query) { json_error(500); }

    if ($info_query->num_rows > 0) {
      $row = $info_query->fetch_object();

      $this->uid  = (int)($row->uid);
      $this->name = $row->user;

      if (!isset($_SESSION['uid'])) {
        $_SESSION['uid'] = $this->uid;
      }
    }
  }
}

$user = new User();

