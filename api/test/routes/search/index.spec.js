/**
 * search API spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const search = require('../../../src/routes/search');

describe('/api/search', () => {
    it('should do something', () => {
        expect(search.routeGet).to.be.a('function');
    });

    it('should search for stuff');
});

