import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as S from '../../src/selectors/funds';

describe('Funds selectors', () => {
    describe('getFundsHistoryCache', () => {
        it('should get the fundHistoryCache', () => {
            expect(S.getFundHistoryCache(fromJS({
                other: {
                    fundHistoryCache: 'foo'
                }
            }))).to.equal('foo');
        });
    });

    describe('getStocksListInfo', () => {
        it('should return stocks and indices', () => {
            expect(S.getStocksListInfo(fromJS({
                other: {
                    stocksList: {
                        stocks: 'foo',
                        indices: 'bar'
                    }
                }
            }))).to.deep.equal({
                stocks: 'foo',
                indices: 'bar'
            });
        });
    });
});

