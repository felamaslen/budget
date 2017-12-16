import { expect } from 'chai';

import * as A from '../../src/actions/app.actions';
import * as C from '../../src/constants/actions';

describe('app.actions', () => {
    describe('aSettingsLoaded', () => {
        it('should return SETTINGS_LOADED', () => expect(A.aSettingsLoaded()).to.deep.equal({
            type: C.SETTINGS_LOADED
        }));
    });
    describe('aUserLoggedOut', () => {
        it('should return USER_LOGGED_OUT', () => expect(A.aUserLoggedOut()).to.deep.equal({
            type: C.USER_LOGGED_OUT
        }));
    });
    describe('aKeyPressed', () => {
        it('should return KEY_PRESSED with req', () => expect(A.aKeyPressed({
            key: 10,
            shift: true
        })).to.deep.equal({
            type: C.KEY_PRESSED,
            key: 10,
            shift: true
        }));
    });
    describe('aTimeUpdated', () => {
        it('should return TIME_UPDATED', () => expect(A.aTimeUpdated()).to.deep.equal({
            type: C.TIME_UPDATED
        }));
    });
    describe('aServerUpdated', () => {
        it('should return SERVER_UPDATED', () => expect(A.aServerUpdated()).to.deep.equal({
            type: C.SERVER_UPDATED
        }));
    });
    describe('aServerUpdateReceived', () => {
        it('should return SERVER_UPDATE_RECEIVED with res', () => expect(A.aServerUpdateReceived({
            foo: 'bar'
        })).to.deep.equal({
            type: C.SERVER_UPDATE_RECEIVED,
            foo: 'bar'
        }));
    });
    describe('aServerAddReceived', () => {
        it('should return SERVER_ADD_RECEIVED with res', () => expect(A.aServerAddReceived({
            foo: 'bar'
        })).to.deep.equal({
            type: C.SERVER_ADD_RECEIVED,
            foo: 'bar'
        }));
    });
});

