# Budget

Personal finance app for web and android

## Instructions:

### Installation:
    - Install dependencies (MySQL server)
    - Create MySQL database
    - Run `npm install`
    - Run `npm run build` to build the app (this is included on postinstall)

#### Environment variables:

These environment variables must be set on your deployment environment, or in `.env`:

List (TODO)

### Production:
    - Run `npm start` and access the app at `localhost:3001` by default

### Maintenance:
    - To scrape fund values: run script (TODO)

### Development:
    - Run `npm run dev:srv` to run a development backend server
    - Run `npm run dev:wds` to run a development web app
    - This is accessible at `localhost:3001` by default

#### Notes: 

When making changes, please update the version number in `package.json` before submitting a pull request to master. This way, updates are pushed to clients, which may cache resources.

## Documentation:

Upon running the server, API documentation is available at `/docs/api`.

