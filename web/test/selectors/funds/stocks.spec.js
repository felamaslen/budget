import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as S from '~client/selectors/funds/stocks';

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

