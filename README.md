# Budget

## Instructions:

### Installation:
 - Install Python 2.7 and MySQL
 - Create MySQL database and schema (TODO: install script)
 - Configure MySQL username and password in `srv/db_info.py` (rename from `.example`)
 - Install Python environment: `./setup.sh`
 - Install nodejs dependencies: `npm i`
 - Set up nginx or apache (TODO: install script)

 - To update/create minified JavaScript and CSS, run:
  * `./updatecache.sh [js] [css]`

 - To scrape fund values, run from the command line:
  *  `./scrape_funds.sh`

### Operation:
 - To run the server:
  *  `./init.sh`
