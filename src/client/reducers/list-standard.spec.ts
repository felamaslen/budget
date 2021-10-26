import * as reducers from './list-standard';
import type { IncomeExtraState } from './types';
import { ListActionType, listOverviewUpdated } from '~client/actions';
import { PageListStandard } from '~client/types/gql';

describe('income reducer', () => {
  describe(ListActionType.OverviewUpdated, () => {
    const myTotalDeductions: IncomeExtraState['totalDeductions'] = [
      { name: 'Tax', value: 5612293 },
    ];

    const action = listOverviewUpdated<PageListStandard.Income, IncomeExtraState>(
      PageListStandard.Income,
      [],
      0,
      0,
      {
        totalDeductions: myTotalDeductions,
      },
    );

    it('should set the totalDeductions property', () => {
      expect.assertions(1);
      const result = reducers.income(undefined, action);

      expect(result.totalDeductions).toStrictEqual(myTotalDeductions);
    });

    describe('when the action has no extra state', () => {
      const actionWithNoExtraState = listOverviewUpdated(PageListStandard.Income, [], 0, 0);

      it('should not modify the totalDeductions property', () => {
        expect.assertions(1);
        const result = reducers.income(
          {
            items: [],
            __optimistic: [],
            total: 0,
            weekly: 0,
            offset: 0,
            olderExists: false,
            totalDeductions: myTotalDeductions,
          },
          actionWithNoExtraState,
        );

        expect(result.totalDeductions).toStrictEqual(myTotalDeductions);
      });
    });
  });
});
