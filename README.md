# Budget

Personal finance app for web, cli and android [![Build Status](https://travis-ci.org/felamaslen/budget.svg?branch=master)](https://travis-ci.org/felamaslen/budget)

## Architecture

There is a web-based API written in Node.js, which also runs a web app. The Android app connects to this API.

- Node version: 12

The CLI app is written in Python 3. See `cli/README.md` for setup info.

For info on building the Android app, see `android/README.md`.

**Please note** that the Android and CLI apps are *deprecated* and *not compatible* with the current API. Development on them ceased a while ago.

## Instructions:

### Installation:

- Install external dependencies
    - PostgreSQL server

- Set environment variables
    - These are in `.env.example`, which you should copy to `.env` and edit with the appropriate values (see below).

- Run `yarn install` to install Node dependencies

- Run `yarn build` to build the web app

### Production:

- Run `yarn start` and access the app at `http://localhost:3000` by default.

### Maintenance:

- Run `yarn scrape_funds` to scrape and cache current fund prices

- Run `yarn scrape_holdings` to scrape and cache current fund holdings

### Development:

- Run `yarn dev` to run a development server with hot module replacement
    - This runs inside a Docker containerised environment
    - All external services are created by docker-compose

- This is accessible at `http://localhost:3000` by default
    - To set the port, change the `PORT` environment variable in `.env`

#### Migrations / seeds:

To run database migrations and seeds on the development environment:

- `docker-compose exec budget sh -c "./node_modules/.bin/knex migrate:latest"`

- `docker-compose exec budget sh -c "./node_modules/.bin/knex seed:run"`

- The admin user PIN is 1234

#### Notes: 

When making changes, please update the version number in `package.json` before submitting a pull request to master. This way, updates are pushed to clients, which may cache resources.

## Documentation:

Upon running the server, API documentation is available at `/docs/api`.

## Environment variables:

These environment variables must be set on your deployment environment, or in `.env`:

Note that the development variables are optional on a production environment.

- `PORT`: the port to listen on
- `DATABASE_URL`: URI for connecting to the database
- `REDIS_HOST`: hostname for redis
- `REDIS_PORT`: custom port for redis (defaults to 6379)
- `DEFAULT_PIN`: the PIN for the first generated user
- `BIRTH_DATE`: the (ISO) date of birth (for use in FTI calculation)
- `IP_BAN_TIME`: how long to ban users for if they make too many bad login attempts
- `IP_BAN_LIMIT`: the period of time to consider when banning users
- `IP_BAN_TRIES`: the maximum number of failed logins before banning users
- `PIE_TOLERANCE`: minimum slice of pie charts to include on list data
- `PIE_DETAIL`:  maximum number of pie slices to return on list data
- `FUND_RESOLUTION`: detail to include on fund price graph
