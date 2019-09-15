import test from 'ava';

import {
    getNavDirection,
} from '~client/modules/nav';

test('getNavDirection handles tabs', (t) => {
    const event = {
        key: 'Tab',
        shiftKey: false,
    };

    t.deepEqual(getNavDirection(event), { dx: 1, dy: 0 });
});

test('getNavDirection handles reverse tabs', (t) => {
    const event = {
        key: 'Tab',
        shiftKey: true,
    };

    t.deepEqual(getNavDirection(event), { dx: -1, dy: 0 });
});

test('getNavDirection handles arrows', (t) => {
    t.deepEqual(getNavDirection({ key: 'ArrowUp' }), { dx: 0, dy: -1 });
    t.deepEqual(getNavDirection({ key: 'ArrowRight' }), { dx: 1, dy: 0 });
    t.deepEqual(getNavDirection({ key: 'ArrowDown' }), { dx: 0, dy: 1 });
    t.deepEqual(getNavDirection({ key: 'ArrowLeft' }), { dx: -1, dy: -0 });
});

test('getNavDirection optionally requires ctrl modifier with arrows', (t) => {
    t.deepEqual(getNavDirection({ key: 'ArrowUp' }, false), { dx: 0, dy: -1 });
    t.deepEqual(getNavDirection({ key: 'ArrowRight' }, false), { dx: 1, dy: 0 });
    t.deepEqual(getNavDirection({ key: 'ArrowDown' }, false), { dx: 0, dy: 1 });
    t.deepEqual(getNavDirection({ key: 'ArrowLeft' }, false), { dx: -1, dy: -0 });

    t.deepEqual(getNavDirection({ key: 'ArrowUp' }, true), { dx: 0, dy: 0 });
    t.deepEqual(getNavDirection({ key: 'ArrowRight' }, true), { dx: 0, dy: 0 });
    t.deepEqual(getNavDirection({ key: 'ArrowDown' }, true), { dx: 0, dy: 0 });
    t.deepEqual(getNavDirection({ key: 'ArrowLeft' }, true), { dx: 0, dy: 0 });

    t.deepEqual(getNavDirection({ ctrlKey: true, key: 'ArrowUp' }, true), { dx: 0, dy: -1 });
    t.deepEqual(getNavDirection({ ctrlKey: true, key: 'ArrowRight' }, true), { dx: 1, dy: 0 });
    t.deepEqual(getNavDirection({ ctrlKey: true, key: 'ArrowDown' }, true), { dx: 0, dy: 1 });
    t.deepEqual(getNavDirection({ ctrlKey: true, key: 'ArrowLeft' }, true), { dx: -1, dy: -0 });
});

test('getNavDirection ignores other events', (t) => {
    t.deepEqual(getNavDirection({ key: 'A' }), { dx: 0, dy: 0 });
});
