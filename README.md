# Budget

## Instructions:

### Installation:
 - Install Python 2.7 and MySQL
 - Create MySQL database called "budget"
 - Install Python environment and MySQL database: `./setup.sh install`
 - Configure MySQL username and password in `srv/db_info.py` (rename from `.example`)
 - Set up nginx or apache. An example nginx configuration is given in `resources/nginx.example.conf`
 - To scrape fund values, run from the command line or as a cron job:
  *  `./scrape_funds.sh`

#### Extra (for devs):
 - Install nodejs dependencies: `npm i`
 - To update/create minified JavaScript and CSS, run:
  * `./updatecache.sh [js] [css]`

### Operation:
 - To run the server:
  *  `./init.sh`
