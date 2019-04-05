const test = require('ava');
const {
    routeGet
} = require('~api/src/routes/search');

test('routeGet is defined', t => {
    t.is(typeof routeGet, 'function');
});

