import test from 'ava';

import {
    aWindowResized,
    aSettingsLoaded,
    aUserLoggedOut,
    aKeyPressed,
    aTimeUpdated,
    aServerUpdated,
    aServerUpdateReceived,
    aServerAddReceived
} from '~client/actions/app.actions';

import {
    WINDOW_RESIZED,
    SETTINGS_LOADED,
    USER_LOGGED_OUT,
    KEY_PRESSED,
    TIME_UPDATED,
    SERVER_UPDATED,
    SERVER_UPDATE_RECEIVED,
    SERVER_ADD_RECEIVED
} from '~client/constants/actions';

test('aWindowResized returns WINDOW_RESIZED', t => {
    t.deepEqual(aWindowResized(100), {
        type: WINDOW_RESIZED, size: 100
    });
});

test('aSettingsLoaded returns SETTINGS_LOADED', t => {
    t.deepEqual(aSettingsLoaded(), {
        type: SETTINGS_LOADED
    });
});

test('aUserLoggedOut returns USER_LOGGED_OUT', t => {
    t.deepEqual(aUserLoggedOut(), {
        type: USER_LOGGED_OUT
    });
});

test('aKeyPressed returns KEY_PRESSED with req', t => {
    t.deepEqual(aKeyPressed({
        key: 10,
        shift: true
    }), {
        type: KEY_PRESSED,
        key: 10,
        shift: true
    });
});

test('aTimeUpdated returns TIME_UPDATED with the time', t => {
    t.deepEqual(aTimeUpdated(10), {
        type: TIME_UPDATED,
        now: 10
    });
});

test('aServerUpdated returns SERVER_UPDATED', t => {
    t.deepEqual(aServerUpdated(), {
        type: SERVER_UPDATED
    });
});

test('aServerUpdateReceived returns SERVER_UPDATE_RECEIVED with res', t => {
    t.deepEqual(aServerUpdateReceived({
        foo: 'bar'
    }), {
        type: SERVER_UPDATE_RECEIVED,
        foo: 'bar'
    });
});

test('aServerAddReceived returns SERVER_ADD_RECEIVED with res', t => {
    t.deepEqual(aServerAddReceived({
        foo: 'bar'
    }), {
        type: SERVER_ADD_RECEIVED,
        foo: 'bar'
    });
});
