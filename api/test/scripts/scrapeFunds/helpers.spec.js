const test = require('ava');
const helpers = require('~api/scripts/scrapeFunds/helpers');

test('removeWhitespace removing whitespace', t => {
    t.is(helpers.removeWhitespace(`a\nb\tc\rd e   f   > >>`), 'abcd e f>>>');
});
