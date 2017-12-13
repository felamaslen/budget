/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/edit.reducer';

describe('Edit reducers', () => {
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
});

