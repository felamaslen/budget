import { expect } from 'chai';

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

describe('app.actions', () => {
    describe('aWindowResized', () => {
        it('should return WINDOW_RESIZED', () => expect(aWindowResized(100)).to.deep.equal({
            type: WINDOW_RESIZED, size: 100
        }));
    });
    describe('aSettingsLoaded', () => {
        it('should return SETTINGS_LOADED', () => expect(aSettingsLoaded()).to.deep.equal({
            type: SETTINGS_LOADED
        }));
    });
    describe('aUserLoggedOut', () => {
        it('should return USER_LOGGED_OUT', () => expect(aUserLoggedOut()).to.deep.equal({
            type: USER_LOGGED_OUT
        }));
    });
    describe('aKeyPressed', () => {
        it('should return KEY_PRESSED with req', () => expect(aKeyPressed({
            key: 10,
            shift: true
        })).to.deep.equal({
            type: KEY_PRESSED,
            key: 10,
            shift: true
        }));
    });
    describe('aTimeUpdated', () => {
        it('should return TIME_UPDATED with the time', () => expect(aTimeUpdated(10)).to.deep.equal({
            type: TIME_UPDATED,
            now: 10
        }));
    });
    describe('aServerUpdated', () => {
        it('should return SERVER_UPDATED', () => expect(aServerUpdated()).to.deep.equal({
            type: SERVER_UPDATED
        }));
    });
    describe('aServerUpdateReceived', () => {
        it('should return SERVER_UPDATE_RECEIVED with res', () => expect(aServerUpdateReceived({
            foo: 'bar'
        })).to.deep.equal({
            type: SERVER_UPDATE_RECEIVED,
            foo: 'bar'
        }));
    });
    describe('aServerAddReceived', () => {
        it('should return SERVER_ADD_RECEIVED with res', () => expect(aServerAddReceived({
            foo: 'bar'
        })).to.deep.equal({
            type: SERVER_ADD_RECEIVED,
            foo: 'bar'
        }));
    });
});

