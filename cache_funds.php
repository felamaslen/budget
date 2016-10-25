<?php

/**
 * Scrape and cache all fund values for present moment
 * Must be run from command line
 */

define('APP_DIR', dirname(__FILE__));

if (php_sapi_name() != 'cli') {
  header('Location: .');
  die;
}

define('CLI_VERBOSE', $argv && isset($argv[1]) && $argv[1] === '-v');

require_once APP_DIR . '/inc/common.php';

$scraper = new FundScraper();

$scraper->scrape();

?>
