import test from 'ava';

import {
    removeWhitespace,
} from '~api/scripts/scrape-funds/helpers';

test('removeWhitespace removing whitespace', (t) => {
    t.is(removeWhitespace('a\nb\tc\rd e   f   > >>'), 'abcd e f>>>');
});
