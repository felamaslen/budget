import 'babel-polyfill';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { takeLatest } from 'redux-saga/effects';

import * as S from '../../src/sagas';
import * as A from '../../src/constants/actions';

import { loadSettings } from '../../src/sagas/app.saga';

describe('sagas.index', () => {
    describe('selectApiKey', () => {
        it('should get the API key from the state', () => {
            expect(S.selectApiKey(fromJS({
                user: {
                    apiKey: 'foo'
                }
            }))).to.equal('foo');
        });
    });

    describe('watchSettingsLoaded', () => {
        it('should takeLatest SETTINGS_LOADED', () => {
            expect(S.watchSettingsLoaded().next().value).to.deep.equal(takeLatest(
                A.SETTINGS_LOADED, loadSettings
            ));
        });
    });

    it('should be tested completely');
});

