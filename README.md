# Budget

## Instructions:

### Installation:
 - Install Python 2.7 and MySQL
 - Create MySQL database called "budget"
 - Install nodejs dependencies: `npm i`
 - Build resources:
  * `grunt`
 - Install Python environment and MySQL database:
  * `./setup.sh install`
 - Configure MySQL username and password in `srv/db_info.py` (rename from `.example`)
 - Set up nginx or apache. An example nginx configuration is given in `resources/nginx.example.conf`

#### Extra (for devs):
 - To update/create minified JavaScript and CSS, run:
  * `grunt [build_js] [build_css]`

### Operation:
 - To run the server:
  *  `./init.sh`
 - To scrape fund values, run from the command line or as a cron job:
  *  `./scrape_funds.sh`
