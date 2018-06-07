/* eslint-disable prefer-reflect */
import '../browser';
import { fromJS, List as list } from 'immutable';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import { delay } from 'redux-saga';
import axios from 'axios';
import { getApiKey } from '../../src/selectors/app';
import { getModalState, suggestionsInfo } from '../../src/selectors/edit';
import * as S from '../../src/sagas/edit.saga';
import { addServerDataRequest } from '../../src/sagas/app.saga';
import * as A from '../../src/actions/edit.actions';
import * as B from '../../src/actions/form.actions';
import { EDIT_CHANGED } from '../../src/constants/actions';

describe('edit.saga', () => {
    describe('triggerEditSuggestionsRequest', () => {
        it('should call the suggetions requester after a delay', () => {
            testSaga(S.triggerEditSuggestionsRequest, { page: 'income', item: 'foo', value: 'bar' })
                .next()
                .call(delay, 100)
                .next()
                .put(A.aSuggestionsRequested({ page: 'income', item: 'foo', value: 'bar' }))
                .next()
                .isDone();
        });
    });

    describe('watchTextInput', () => {
        it('should continuously watch the text input for changes, triggering suggestions request if appropriate', () => {
            testSaga(S.watchTextInput)
                .next()
                .take(EDIT_CHANGED)
                .next()
                .select(suggestionsInfo)
                .next({ page: 'food', item: 'item', value: 'value' })
                .fork(S.triggerEditSuggestionsRequest, { page: 'food', item: 'item', value: 'value' })
                .next()
                .take(EDIT_CHANGED)
                .next()
                .select(suggestionsInfo)
                .next({ page: 'general', item: 'item', value: 'value' });

            testSaga(S.watchTextInput)
                .next()
                .take(EDIT_CHANGED)
                .next()
                .select(suggestionsInfo)
                .next({ page: 'overview', item: 'balance', value: 'bar' })
                .take(EDIT_CHANGED);
        });
    });

    describe('requestEditSuggestions', () => {
        it('should request edit suggestions, if a value was typed', () => {
            testSaga(S.requestEditSuggestions, { reqId: 1, page: 'food', item: 'foo', value: 'bar' })
                .next()
                .select(getApiKey)
                .next('some_api_key')
                .call(axios.get, 'api/v4/data/search/food/foo/bar/5', { headers: { Authorization: 'some_api_key' } })
                .next({ data: { data: { list: ['foo'] } } })
                .put(A.aSuggestionsReceived({ data: { list: ['foo'] }, reqId: 1 }))
                .next()
                .isDone();
        });

        it('should insert null into the suggestions, otherwise', () => {
            testSaga(S.requestEditSuggestions, { reqId: 1, page: 'food', item: 'foo', value: '' })
                .next()
                .put(A.aSuggestionsReceived({ items: null }))
                .next()
                .isDone();
        });
    });

    describe('handleModal', () => {
        const state = {
            modalDialogType: 'add',
            invalidKeys: list.of(),
            modalDialogLoading: true,
            item: 'foo',
            fields: 'bar'
        };

        it('should work as expected', () => {
            testSaga(S.handleModal, { page: 'page1' })
                .next()
                .select(getModalState)
                .next(state)
                .call(addServerDataRequest, { item: 'foo', fields: 'bar', page: 'page1' })
                .next()
                .put(B.aMobileDialogClosed(null))
                .next()
                .isDone();
        });

        describe('should not proceed if', () => {
            it('there is no page', () => {
                testSaga(S.handleModal, {})
                    .next()
                    .select(getModalState)
                    .next(state)
                    .isDone();
            });

            it('the modal dialog isn\'t of tye "add" type', () => {
                testSaga(S.handleModal, { page: 'page1' })
                    .next()
                    .select(getModalState)
                    .next({ ...state, modalDialogType: 'not add' })
                    .isDone();
            });

            it('there are invalid data', () => {
                testSaga(S.handleModal, { page: 'page1' })
                    .next()
                    .select(getModalState)
                    .next({ ...state, invalidKeys: list.of(1) })
                    .isDone();
            });

            it('there dialog was not set to loading', () => {
                testSaga(S.handleModal, { page: 'page1' })
                    .next()
                    .select(getModalState)
                    .next({ ...state, modalDialogLoading: false })
                    .isDone();
            });
        });
    });
});


