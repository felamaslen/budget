import test from 'ava';

import {
    validateField,
} from '~client/modules/validate';

test('validateField requires a cost to be initialised', (t) => {
    t.throws(() => validateField('cost', null));
    t.throws(() => validateField('cost', undefined));
});
