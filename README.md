# Budget

Personal finance app for web, cli and android

## Architecture

There is a web-based API written in Node.js, which also runs a web app. The Android app connects to this API.

- Node version: 8

The CLI app is written in Python 3. See `cli/README.md` for setup info.

For info on building the Android app, see `android/README.md`.

## Instructions:

### Installation:

- Install external dependencies
    - MySQL server

- Set environment variables
    - These are in `.env.example`, which you should copy to `.env` and edit with the appropriate values (see below).

- Run `npm install` to install Node dependencies
	- This will also build the web app into `web/build`

### Production:

- Run `npm start` and access the app at `http://localhost:3000` by default.

### Maintenance:

- Run `npm run install_db` to drop all data and create clean tables in the database

- Run `npm run scrape_funds` to scrape and cache current fund prices

- Run `npm run scrape_holdings` to scrape and cache current fund holdings

### Development:

- Run `npm run dev` to run a development server with hot module replacement

- This is accessible at `http://localhost:3000` by default

#### Notes: 

When making changes, please update the version number in `package.json` before submitting a pull request to master. This way, updates are pushed to clients, which may cache resources.

## Documentation:

Upon running the server, API documentation is available at `/docs/api`.


## Environment variables:

These environment variables must be set on your deployment environment, or in `.env`:

Note that the development variables are optional on a production environment.

- `PORT`: the port to listen on
- `MYSQL_URI`: URI for connecting to the production database
- `MYSQL_URI_TEST`: URI for connecting to a testing database
- `DEFAULT_PIN`: the PIN for the first generated user
- `BIRTH_DATE`: the (ISO) date of birth (for use in FTI calculation)
- `IP_BAN_TIME`: how long to ban users for if they make too many bad login attempts
- `IP_BAN_LIMIT`: the period of time to consider when banning users
- `IP_BAN_TRIES`: the maximum number of failed logins before banning users
- `USER_HASH_SALT`: the salt to hash users' PINs with (TODO: better authentication mechanism)
- `WEB_URL`: the URL to access the web app at, without trailing slash
- `PIE_TOLERANCE`: minimum slice of pie charts to include on list data
- `PIE_DETAIL`:  maximum number of pie slices to return on list data
- `FUND_RESOLUTION`: detail to include on fund price graph
- `FUND_TEST_URL`: URL to an example fund for the scraper to test with
- `FUND_TEST_URL_SHARE`: URL to an example share-type fund for the scraper to test with
- `DO_STOCKS_LIST`: boolean to toggle rendering of the fund holdings list
- `STOCKS_API_KEY`: API key to access realtime stock price data (TODO)
- `STOCK_INDICES`: extra indices to track on the stocks list
