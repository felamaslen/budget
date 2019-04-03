/* eslint-disable prefer-reflect */
import test from 'ava';
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

test('triggerEditSuggestionsRequest calling the suggetions requester after a delay', t => {
    t.is(1, 1);
    testSaga(triggerEditSuggestionsRequest, { page: 'income', item: 'foo', value: 'bar' })
        .next()
        .call(delay, 100)
        .next()
        .put(A.aSuggestionsRequested({ page: 'income', item: 'foo', value: 'bar' }))
        .next()
        .isDone();
});

test('watchTextInput continuouslying watch the text input for changes, triggering suggestions request if appropriate', t => {
    t.is(1, 1);
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

test('requestEditSuggestions requesting edit suggestions, if a value was typed', t => {
    t.is(1, 1);
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

test('requestEditSuggestions inserting null into the suggestions, otherwise', t => {
    t.is(1, 1);
    testSaga(requestEditSuggestions, { reqId: 1, page: 'food', item: 'foo', value: '' })
        .next()
        .put(A.aSuggestionsReceived({ items: null }))
        .next()
        .isDone();
});

const stateModal = {
    modalDialogType: 'add',
    invalidKeys: list.of(),
    modalDialogLoading: true,
    item: 'foo',
    fields: 'bar'
};

test('handleModal working as expected', t => {
    t.is(1, 1);
    testSaga(handleModal, { page: 'page1' })
        .next()
        .select(getModalState)
        .next(stateModal)
        .call(addServerDataRequest, { item: 'foo', fields: 'bar', page: 'page1' })
        .next()
        .put(B.aMobileDialogClosed(null))
        .next()
        .isDone();
});

test('handleModal not proceeding if there is no page', t => {
    t.is(1, 1);
    testSaga(handleModal, {})
        .next()
        .select(getModalState)
        .next(stateModal)
        .isDone();
});

test('handleModal not proceeding if the modal dialog isn\'t of tye "add" type', t => {
    t.is(1, 1);
    testSaga(handleModal, { page: 'page1' })
        .next()
        .select(getModalState)
        .next({ ...stateModal, modalDialogType: 'not add' })
        .isDone();
});

test('handleModal not proceeding if there are invalid data', t => {
    t.is(1, 1);
    testSaga(handleModal, { page: 'page1' })
        .next()
        .select(getModalState)
        .next({ ...stateModal, invalidKeys: list.of(1) })
        .isDone();
});

test('handleModal not proceeding if there dialog was not set to loading', t => {
    t.is(1, 1);
    testSaga(handleModal, { page: 'page1' })
        .next()
        .select(getModalState)
        .next({ ...stateModal, modalDialogLoading: false })
        .isDone();
});

