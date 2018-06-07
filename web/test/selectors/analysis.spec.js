import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as S from '../../src/selectors/analysis';

describe('Analysis selectors', () => {
    describe('requestProps', () => {
        it('should get the loading status, period, grouping and timeIndex', () => {
            expect(S.requestProps(fromJS({
                other: {
                    analysis: {
                        loading: true,
                        period: 100,
                        grouping: 200,
                        timeIndex: 300
                    }
                }
            })))
                .to.deep.equal({
                    loading: true,
                    period: 100,
                    grouping: 200,
                    timeIndex: 300
                });
        });
    });
});

