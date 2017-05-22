# Budget

## Instructions:

### Installation:
 - Install Python 2.7 and MySQL
 - Create MySQL database called "budget"
 - Install nodejs dependencies: `npm i`
 - Update `local.conf.js` (rename from `.example`) with correct parameters
 - Build resources:
  * `gulp`
 - Install Python environment and MySQL database:
  * `./scripts/setup.sh install`
 - Configure MySQL username and password in `srv/app/db_info.py` (rename from `.example`)
 - Set up nginx or apache. An example nginx configuration is given in `resources/nginx.example.conf`

#### Extra (for devs):
 - To update/create minified JavaScript and CSS, run:
  * `./scripts/update_cache.sh [js] [css]`

### Operation:
 - To run the server:
  *  `./scripts/init_server.sh`
 - To scrape fund values, run from the command line or as a cron job:
  *  `./scripts/scrape_funds.sh`
 - To scrape fund holdings:
  *  `./scripts/scrape_holdings.sh`

