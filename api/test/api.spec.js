/**
 * API tests
 */

const routeUser = require('./routes/user');
const routeData = require('./routes/data');
const routeSearch = require('./routes/search');

describe('Server', () => {
    // TODO: write tests
});

describe('API routes:', () => {
    routeUser();
    routeData();
    routeSearch();
});

