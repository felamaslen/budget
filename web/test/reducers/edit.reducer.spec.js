/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/edit.reducer';
import { dateInput } from '../../src/misc/date';

describe('Edit reducers', () => {
    describe('rActivateEditable', () => {
        it('should be tested');
    });
    describe('rChangeEditable', () => {
        it('should be tested');
    });
    describe('getInvalidInsertDataKeys', () => {
        it('should get a list of invalid data keys', () => {
            const items = fromJS([
                { item: 'item', value: '' },
                { item: 'foo', value: '' },
                { item: 'category', value: '' },
                { item: 'category', value: 'foobar' },
                { item: 'society', value: '' },
                { item: 'holiday', value: '' },
                { item: 'bar', value: '' },
                dateInput('13/10/17'),
                dateInput('foo')
            ]);

            expect(R.getInvalidInsertDataKeys(items).toJS())
                .to.deep.equal([0, 2, 4, 5, 8]);
        });
    });
    describe('stringifyFields', () => {
        it('should serialise fields into an object of strings', () => {
            const fields = fromJS([
                { item: 'foo1', value: 'bar' },
                { item: 'foo2', value: dateInput('13/10/17') },
                { item: 'foo3', value: 10.43 }
            ]);

            expect(R.stringifyFields(fields)).to.deep.equal({
                foo1: 'bar',
                foo2: '2017-10-13',
                foo3: 10.43
            });
        });
    });
    describe('rHandleServerAdd', () => {
        it('should be tested');
    });
    describe('rHandleSuggestions', () => {
        it('should be tested');
    });

    describe('rHandleSuggestions', () => {
        it('should set editSuggestions/loading to false', () => {
            expect(R.rHandleSuggestions(fromJS({
                editSuggestions: {
                    loading: true
                }
            }), {}).getIn(['editSuggestions', 'loading']))
                .to.equal(false);
        });

        it('should set the active suggestion to -1', () => {
            expect(R.rHandleSuggestions(fromJS({
                editSuggestions: {
                    active: 5
                }
            }), {}).getIn(['editSuggestions', 'active']))
                .to.equal(-1);
        });

        it('should reset the list if there are no results, or if the request is stale', () => {
            const resultNoItems = R.rHandleSuggestions(fromJS({
                editSuggestions: {
                    active: 5
                }
            }), {});

            expect(resultNoItems.getIn(['editSuggestions', 'list']).size).to.equal(0);
            expect(resultNoItems.getIn(['editSuggestions', 'reqId'])).to.equal(null);

            const resultWrongId = R.rHandleSuggestions(fromJS({
                editSuggestions: {
                    active: 5,
                    reqId: 100
                }
            }), { items: ['foo'], reqId: 101 });

            expect(resultWrongId.getIn(['editSuggestions', 'list']).size).to.equal(0);
            expect(resultWrongId.getIn(['editSuggestions', 'reqId'])).to.equal(null);
        });

        it('should insert the list, excluding exact matches, into the state', () => {
            expect(R.rHandleSuggestions(fromJS({
                editSuggestions: {
                    loading: true,
                    active: 3,
                    reqId: 100,
                    list: []
                },
                edit: {
                    active: {
                        value: 'foo'
                    }
                }
            }), {
                items: ['foo', 'Foo', 'fOo', 'bar', 'baz'],
                reqId: 100
            }).get('editSuggestions').toJS())
                .to.deep.equal({
                    loading: false,
                    active: -1,
                    reqId: 100,
                    list: ['bar', 'baz']
                });
        });
    });

    describe('rRequestSuggestions', () => {
        it('should be tested');
    });
    describe('rChangeFundTransactions', () => {
        it('should be tested');
    });
    describe('rAddFundTransactions', () => {
        it('should be tested');
    });
    describe('rRemoveFundTransactions', () => {
        it('should be tested');
    });
});

