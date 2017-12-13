/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import '../browser';
import { fromJS, List as list } from 'immutable';
import { expect } from 'chai';
import { select, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { selectApiKey } from '../../src/sagas';
import * as S from '../../src/sagas/edit.saga';
import { addServerDataRequest } from '../../src/sagas/app.saga';

import { aSuggestionsReceived } from '../../src/actions/edit.actions';
import { aMobileDialogClosed } from '../../src/actions/form.actions';

describe('edit.saga', () => {
    describe('requestEditSuggestions', () => {
        it('should return after notifying the store if passed an empty value', () => {
            const result = S.requestEditSuggestions({ payload: { value: '' } });

            expect(result.next().value).to.be.deep.equal(put(aSuggestionsReceived({ items: null })));
            expect(result.next().value).to.be.undefined;
        });

        const payload = { reqId: 12391, page: 'food', item: 'item', value: 'foo' };
        const iter = S.requestEditSuggestions({ payload });

        let next = iter.next();

        it('should select the apiKey', () => {
            expect(next.value).to.deep.equal(select(selectApiKey));
            next = iter.next('some_api_key');
        });
        it('should call the API', () => {
            expect(next.value).to.deep.equal(call(axios.get, 'api/v3/data/search/food/item/foo/5', {
                headers: { 'Authorization': 'some_api_key' }
            }));
            next = iter.next({ data: { data: { list: [1, 2, 3] } } });
        });

        describe('if the API responded without an error', () => {
            it('should notify the store with the response', () => {
                expect(next.value).to.deep.equal(put(aSuggestionsReceived({
                    items: list([1, 2, 3]), reqId: 12391
                })));
            });
        });

        describe('otherwise', () => {
            const iter2 = S.requestEditSuggestions({ payload });
            iter2.next(); // select api key
            iter2.next('some_api_key');

            it('should log a message to the console');
        });
    });

    describe('selectModalState', () => {
        it('should select the required info from the state', () => {
            expect(S.selectModalState(fromJS({
                modalDialog: {
                    type: 'foo',
                    invalidKeys: 'bar',
                    loading: 'baz',
                    fieldsString: 'item',
                    fieldsValidated: 'fields'
                }
            }))).to.deep.equal({
                modalDialogType: 'foo',
                invalidKeys: 'bar',
                modalDialogLoading: 'baz',
                item: 'item',
                fields: 'fields'
            });
        });
    });

    describe('handleModal', () => {
        it('should do nothing if no payload was sent', () => {
            const iter = S.handleModal({ payload: null });
            iter.next();
            expect(iter.next({}).value).to.be.undefined;
        });
        it('should do nothing if the modal dialog type isn\'t add', () => {
            const iter = S.handleModal({ payload: 'something' });
            iter.next();
            expect(iter.next({ modalDialogType: 'not-add' }).value).to.be.undefined;
        });
        it('should do nothing if there are invalid data', () => {
            const iter = S.handleModal({ payload: 'something' });
            iter.next();
            expect(iter.next({ modalDialogType: 'add', invalidKeys: list.of(1, 2) }).value).to.be.undefined;
        });
        it('should do nothing if the dialog wasn\'t set to loading', () => {
            const iter = S.handleModal({ payload: 'something' });
            iter.next();
            expect(iter.next({
                modalDialogType: 'add', invalidKeys: list.of(), modalDialogLoading: false
            }).value).to.be.undefined;
        });

        const iter = S.handleModal({
            payload: {
                pageIndex: 3
            }
        });
        iter.next();

        let next = iter.next({
            modalDialogType: 'add',
            invalidKeys: list.of(),
            modalDialogLoading: true,
            item: 'item',
            fields: [{ field1: 'value' }]
        });

        it('should call addServerDataRequest', () => {
            expect(next.value).to.deep.equal(call(addServerDataRequest, {
                item: 'item',
                fields: [{ field1: 'value' }],
                pageIndex: 3
            }));

            next = iter.next();
        });

        it('should notify the store that the dialog was closed', () => {
            expect(next.value).to.deep.equal(put(aMobileDialogClosed(null)));
        });
    });
});


