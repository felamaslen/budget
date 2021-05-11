import numericHash from 'string-hash';

import { moveBucketRemainderToCatchAll } from './hooks';
import { AnalysisPage, Bucket } from '~client/types/gql';

describe('Bucket hooks', () => {
  describe(moveBucketRemainderToCatchAll.name, () => {
    const buckets: Bucket[] = [
      {
        id: numericHash('bills-null'),
        page: AnalysisPage.Bills,
        filterCategory: null,
        actualValue: 10092,
        expectedValue: 10000,
      },
      {
        id: numericHash('food-fruit'),
        page: AnalysisPage.Food,
        filterCategory: 'Fruit',
        actualValue: 1045,
        expectedValue: 1500,
      },
      {
        id: numericHash('food-null'),
        page: AnalysisPage.Food,
        filterCategory: null,
        actualValue: 550,
        expectedValue: 1000,
      },
      {
        id: numericHash('food-meat'),
        page: AnalysisPage.Food,
        filterCategory: 'Meat',
        actualValue: 4215,
        expectedValue: 4000,
      },
    ];

    it('should add the remainder from the unfilled buckets to the catch-all bucket', () => {
      expect.assertions(1);
      expect(moveBucketRemainderToCatchAll(buckets)).toStrictEqual<Bucket[]>([
        {
          id: numericHash('bills-null'),
          page: AnalysisPage.Bills,
          filterCategory: null,
          actualValue: 10092,
          expectedValue: 10000,
        },
        {
          id: numericHash('food-null'),
          page: AnalysisPage.Food,
          filterCategory: null,
          actualValue: 550 - (1500 - 1045 + (4000 - 4215)),
          expectedValue: 1000,
        },
        {
          id: numericHash('food-fruit'),
          page: AnalysisPage.Food,
          filterCategory: 'Fruit',
          actualValue: 1045,
          expectedValue: 1500,
        },
        {
          id: numericHash('food-meat'),
          page: AnalysisPage.Food,
          filterCategory: 'Meat',
          actualValue: 4215,
          expectedValue: 4000,
        },
      ]);
    });
  });
});
