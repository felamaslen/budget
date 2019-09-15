const test = require('ava');

const {
    mapInternalToExternal,
    mapExternalToInternal,
} = require('../../src/modules/key-map');

test('mapInternalToExternal maps a database result to a deep javascript object', (t) => {
    const dbResult = {
        foo_db: 'yes',
        yas: 'no',
    };

    const map = [
        { internal: 'foo_db', external: 'foo.bak' },
    ];

    const result = mapInternalToExternal(map)(dbResult);

    const expectedResult = {
        foo: {
            bak: 'yes',
        },
        yas: 'no',
    };

    t.deepEqual(result, expectedResult);
});

test('mapExternalToInternal maps a javascript object to a database row', (t) => {
    const map = [
        { internal: 'foo_db', external: 'foo.bak' },
        { internal: 'bar_db', external: 'bar' },
    ];

    const jsObject = {
        foo: {
            bak: 'yes',
        },
        bar: 'no',
        baz: null,
    };

    const result = mapExternalToInternal(map)(jsObject);

    const expectedResult = {
        foo_db: 'yes',
        bar_db: 'no',
        baz: null,
    };

    t.deepEqual(result, expectedResult);
});
