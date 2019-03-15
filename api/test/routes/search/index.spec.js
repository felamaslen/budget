/**
 * search API spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const search = require('~api/src/routes/search');

describe('/api/search', () => {
    it('works', () => {
        expect(search.routeGet).to.be.a('function');
    });
});

