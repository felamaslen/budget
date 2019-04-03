/* eslint-disable prefer-reflect */
import '~client-test/browser';
import { List as list } from 'immutable';
import { testSaga } from 'redux-saga-test-plan';
import { delay } from 'redux-saga';
import axios from 'axios';
import { getApiKey } from '~client/selectors/app';
import { getModalState, suggestionsInfo } from '~client/selectors/edit';
import {
    triggerEditSuggestionsRequest,
    watchTextInput,
    requestEditSuggestions,
    handleModal
} from '~client/sagas/edit.saga';
import { addServerDataRequest } from '~client/sagas/app.saga';
import * as A from '~client/actions/edit.actions';
import * as B from '~client/actions/form.actions';
import { EDIT_CHANGED } from '~client/constants/actions';

describe('edit.saga', () => {
    describe('triggerEditSuggestionsRequest', () => {
        it('should call the suggetions requester after a delay', () => {
            testSaga(triggerEditSuggestionsRequest, { page: 'income', item: 'foo', value: 'bar' })
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
            testSaga(watchTextInput)
                .next()
                .take(EDIT_CHANGED)
                .next()
                .select(suggestionsInfo)
                .next({ page: 'food', item: 'item', value: 'value' })
                .fork(triggerEditSuggestionsRequest, { page: 'food', item: 'item', value: 'value' })
                .next()
                .take(EDIT_CHANGED)
                .next()
                .select(suggestionsInfo)
                .next({ page: 'general', item: 'item', value: 'value' });

            testSaga(watchTextInput)
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
            testSaga(requestEditSuggestions, { reqId: 1, page: 'food', item: 'foo', value: 'bar' })
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
            testSaga(requestEditSuggestions, { reqId: 1, page: 'food', item: 'foo', value: '' })
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
            testSaga(handleModal, { page: 'page1' })
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
                testSaga(handleModal, {})
                    .next()
                    .select(getModalState)
                    .next(state)
                    .isDone();
            });

            it('the modal dialog isn\'t of tye "add" type', () => {
                testSaga(handleModal, { page: 'page1' })
                    .next()
                    .select(getModalState)
                    .next({ ...state, modalDialogType: 'not add' })
                    .isDone();
            });

            it('there are invalid data', () => {
                testSaga(handleModal, { page: 'page1' })
                    .next()
                    .select(getModalState)
                    .next({ ...state, invalidKeys: list.of(1) })
                    .isDone();
            });

            it('there dialog was not set to loading', () => {
                testSaga(handleModal, { page: 'page1' })
                    .next()
                    .select(getModalState)
                    .next({ ...state, modalDialogLoading: false })
                    .isDone();
            });
        });
    });
});


