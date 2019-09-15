const test = require('ava');
const {
    getNewBadLoginCount,
} = require('~api/routes/user');


test('getNewBadLoginCount increments the counter for recent logs', (t) => {
    t.is(getNewBadLoginCount(1, false, false, false), 2);
    t.is(getNewBadLoginCount(2, false, false, false), 3);
});

test('getNewBadLoginCount returns the current counter for active bans', (t) => {
    t.is(getNewBadLoginCount(1, true, false, false), 1);
    t.is(getNewBadLoginCount(5, true, false, false), 5);
});
test('getNewBadLoginCount returns the current counter for active bans despite an expired log', (t) => {
    t.is(getNewBadLoginCount(1, true, true, false), 1);
    t.is(getNewBadLoginCount(5, true, true, false), 5);
});

test('getNewBadLoginCount resets the counter for expired logs with no ban', (t) => {
    t.is(getNewBadLoginCount(4, false, true, false), 1);
    t.is(getNewBadLoginCount(1, false, true, false), 1);
});

test('getNewBadLoginCount resets the counter for expired bans', (t) => {
    t.is(getNewBadLoginCount(4, true, null, true), 1);
    t.is(getNewBadLoginCount(1, true, null, true), 1);
});
