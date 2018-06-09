import { fromJS } from 'immutable';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import * as R from '../../src/reducers/overview.reducer';

describe('Overview reducer', () => {
    describe('rProcessDataOverview', () => {
        const costMap = fromJS({
            balance: [13000, 15000, 16000, 15500, 0, 0, 0],
            balanceOld: [10000, 11500, 11200],
            funds: [100, 101, 102, 103, 0, 0, 0],
            fundsOld: [94, 105, 110],
            fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
            income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
            bills: [1000, 900, 400, 650, 0, 0, 0],
            food: [50, 13, 20, 19, 0, 0, 0],
            general: [150, 90, 10, 35, 0, 0, 0],
            holiday: [10, 1000, 95, 13, 0, 0, 0],
            social: [50, 65, 134, 10, 0, 0, 0]
        });

        const startDate = DateTime.fromObject({ year: 2017, month: 4 });
        const endDate = DateTime.fromObject({ year: 2017, month: 10 });
        const currentDate = DateTime.fromObject({ year: 2017, month: 6 });
        const futureMonths = 4;

        const now = DateTime.fromISO('2018-01-22');

        const result = R.rProcessDataOverview(now, {
            costMap, startDate, endDate, currentDate, futureMonths
        }).toJS();

        it('should return the correct number of rows and columns', () => {
            expect(result).to.have.property('numRows', 7);
            expect(result).to.have.property('numCols', 1);
        });

        it('should return the correct year month values', () => {
            expect(result).to.have.property('futureMonths', 4);
            expect(result).to.have.deep.property('startDate', startDate);
            expect(result).to.have.deep.property('endDate', endDate);
            expect(result).to.have.deep.property('currentDate', currentDate);
            expect(result).to.have.deep.property('dates', [
                startDate.plus({ months: 0 }).endOf('month'),
                startDate.plus({ months: 1 }).endOf('month'),
                startDate.plus({ months: 2 }).endOf('month'),
                startDate.plus({ months: 3 }).endOf('month'),
                startDate.plus({ months: 4 }).endOf('month'),
                startDate.plus({ months: 5 }).endOf('month'),
                startDate.plus({ months: 6 }).endOf('month')
            ]);
        });

        it('should return the correct calculated cost values', () => {
            expect(result).to.have.deep.property('cost', {
                balance: [13000, 15000, 16000, 15500, 0, 0, 0],
                balanceOld: [10000, 11500, 11200],
                balanceWithPredicted: [13000, 15000, 16000, 17533, 19516, 21000, 23283],
                predicted: [13000, 12832, 15736, 17533, 19516, 21000, 23283],
                spending: [1260, 2068, 765, 967, 317, 317, 317],
                net: [740, -168, 735, 1533, 1983, 1483, 2283],
                income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                funds: [100, 101, 102, 103, 103, 104, 104],
                fundsOld: [94, 105, 110],
                fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                bills: [1000, 900, 400, 650, 0, 0, 0],
                food: [50, 13, 28, 28, 28, 28, 28],
                general: [150, 90, 14, 90, 90, 90, 90],
                social: [50, 65, 189, 65, 65, 65, 65],
                holiday: [10, 1000, 134, 134, 134, 134, 134]
            });

            expect(result).to.have.deep.property('costActual', {
                balance: [13000, 15000, 16000, 15500, 0, 0, 0],
                balanceOld: [10000, 11500, 11200],
                income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                funds: [100, 101, 102, 103, 0, 0, 0],
                fundsOld: [94, 105, 110],
                fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                bills: [1000, 900, 400, 650, 0, 0, 0],
                food: [50, 13, 20, 19, 0, 0, 0],
                general: [150, 90, 10, 35, 0, 0, 0],
                social: [50, 65, 134, 10, 0, 0, 0],
                holiday: [10, 1000, 95, 13, 0, 0, 0]
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

