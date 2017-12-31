import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/overview.reducer';

describe('Overview reducer', () => {
    describe('rProcessDataOverview', () => {
        const costMap = fromJS({
            balance: [13000, 15000, 16000, 15500, 0, 0, 0],
            balanceOld: [10000, 11500, 11200],
            funds: [100, 101, 102, 103, 0, 0, 0],
            fundsOld: [94, 105, 110],
            income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
            bills: [1000, 900, 400, 650, 0, 0, 0],
            food: [50, 13, 20, 19, 0, 0, 0],
            general: [150, 90, 10, 35, 0, 0, 0],
            holiday: [10, 1000, 95, 13, 0, 0, 0],
            social: [50, 65, 134, 10, 0, 0, 0]
        });

        const startYearMonth = [2017, 4];
        const endYearMonth = [2017, 10];
        const currentYearMonth = [2017, 6];
        const futureMonths = 4;

        const result = R.rProcessDataOverview(
            costMap, startYearMonth, endYearMonth, currentYearMonth, futureMonths
        ).toJS();

        it('should return the correct number of rows and columns', () => {
            expect(result).to.have.property('numRows', 7);
            expect(result).to.have.property('numCols', 1);
        });

        it('should return the correct future keys', () => {
            expect(result).to.have.property('futureKey', 3);
        });

        it('should return the correct year month values', () => {
            expect(result).to.have.property('futureMonths', 4);
            expect(result).to.have.deep.property('startYearMonth', [2017, 4]);
            expect(result).to.have.deep.property('endYearMonth', [2017, 10]);
            expect(result).to.have.deep.property('currentYearMonth', [2017, 6]);
            expect(result).to.have.deep.property('yearMonths', [
                [2017, 4],
                [2017, 5],
                [2017, 6],
                [2017, 7],
                [2017, 8],
                [2017, 9],
                [2017, 10]
            ]);
        });

        it('should return the correct calculated cost values', () => {
            expect(result).to.have.deep.property('cost', {
                balance: [13000, 15000, 16000, 15500, 0, 0, 0],
                balanceOld: [10000, 11500, 11200],
                balanceWithPredicted: [13000, 15000, 16000, 16986, 18421, 19357, 21092],
                predicted: [13740, 12832, 15841, 16986, 18421, 19357, 21092],
                spending: [1260, 2068, 659, 1515, 865, 865, 865],
                net: [740, -168, 841, 986, 1435, 936, 1735],
                income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                funds: [100, 101, 102, 103, 103, 104, 104],
                fundsOld: [94, 105, 110],
                bills: [1000, 900, 400, 650, 0, 0, 0],
                food: [50, 13, 20, 25, 25, 25, 25],
                general: [150, 90, 10, 110, 110, 110, 110],
                social: [50, 65, 134, 60, 60, 60, 60],
                holiday: [10, 1000, 95, 670, 670, 670, 670]
            });
        });
    });

    describe('rProcessDataOverviewRaw', () => {
        it('should be tested');
    });

    describe('rGetOverviewRows', () => {
        it('should be tested');
    });

    describe('rCalculateOverview', () => {
        it('should be tested');
    });

    describe('processPageDataOverview', () => {
        it('should be tested');
    });
});
