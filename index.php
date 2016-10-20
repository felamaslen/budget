<?php

require_once dirname(__FILE__) . '/inc/common.php';

$dev = isset($_GET['dev']);

?><!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="css/budget<?php
if ($dev) {
  print '.css';
}
else {
  print '.min.css?v=' . CACHE_SERIAL;
}
?>">
    <link rel="icon" type="image/png" href="img/favicon.png">
    <title>Budget</title>
  </head>
  <body>
    <div id="main-outer">
      <div id="main-inner">
        <div id="nav-outer">
          <div id="nav-inner">
            <ul class="nav-list noselect">
              <li><a class="nav-link" id="nav-link-overview">Overview</a>
              <li><a class="nav-link" id="nav-link-analysis">Analysis</a>
              <li><a class="nav-link" id="nav-link-funds">Funds</a>
              <li><a class="nav-link" id="nav-link-in">In</a>
              <li><a class="nav-link" id="nav-link-bills">Bills</a>
              <li><a class="nav-link" id="nav-link-food">Food</a>
              <li><a class="nav-link" id="nav-link-general">General</a>
              <li><a class="nav-link" id="nav-link-holiday">Holiday</a>
              <li><a class="nav-link" id="nav-link-social">Social</a>
              <li><a class="nav-link-btn" id="nav-link-logout">Log out</a>
            </ul>
          </div>
        </div>
        <div id="doc-outer">
          <div id="doc-inner">
          </div>
        </div>
      </div>
    </div>
    <div id="bg"></div>
    <div id="login-form">
      <h3>Enter your PIN:</h3>
      <div class="input-pin"></div>
      <div class="input-pin"></div>
      <div class="input-pin"></div>
      <div class="input-pin"></div>
    </div>
    <script>var pieTolerance=<?php print PIE_TOLERANCE; ?>;</script>
<?php if ($dev): ?>
    <script src="js/jquery.min.js"></script>
    <script src="js/js.cookie.js"></script>
    <script src="js/budget.js"></script>
<?php else: ?>
<script src="js/main.min.js?v=<?php print CACHE_SERIAL; ?>"></script>
<?php endif; ?>
  </body>
</html>
