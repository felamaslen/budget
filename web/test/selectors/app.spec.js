import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as S from '../../src/selectors/app';

describe('App selectors', () => {
    describe('apiKey', () => {
        it('should get the API key from the state', () => {
            expect(S.getApiKey(fromJS({
                user: {
                    apiKey: 'foo'
                }
            }))).to.equal('foo');
        });
    });

    describe('getRequestList', () => {
        it('should get the requestList and map it to each request', () => {
            expect(S.getRequestList(fromJS({
                edit: {
                    requestList: [{ req: 1, foo: 'bar' }, { req: 2, bar: 'baz' }]
                }
            })).toJS()).to.deep.equal([1, 2]);
        });
    });

    describe('getAddData', () => {
        it('should get the fields and item', () => {
            expect(S.getAddData(fromJS({
                edit: {
                    addFields: 'foo',
                    addFieldsString: 'bar'
                }
            }))).to.deep.equal({ fields: 'foo', item: 'bar' });
        });
    });

    describe('getContentParamsAnalysis', () => {
        it('should get the periodKey and groupingKey from state', () => {
            expect(S.getContentParamsAnalysis(fromJS({
                other: {
                    analysis: {
                        period: 'foo',
                        grouping: 'bar',
                        timeIndex: 'baz'
                    }
                }
            }))).to.deep.equal({
                periodKey: 'foo',
                groupingKey: 'bar',
                timeIndex: 'baz'
            });
        });
    });

    describe('getLoadedStatus', () => {
        it('should return the pagesLoaded status from state', () => {
            expect(S.getLoadedStatus(fromJS({ pagesLoaded: { foo: true, bar: false } }), 'foo')).to.equal(true);
            expect(S.getLoadedStatus(fromJS({ pagesLoaded: { foo: true, bar: false } }), 'bar')).to.equal(false);
            expect(S.getLoadedStatus(fromJS({ pagesLoaded: { foo: true, bar: false } }), 'baz')).to.equal(false);
        });
    });
});
