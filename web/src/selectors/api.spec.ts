import { getApiLoading } from './api';

import { generateFakeId } from '~client/modules/data';
import { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import { PageListStandard, RequestType } from '~client/types';

describe(getApiLoading.name, () => {
  describe.each`
    case              | loading | result
    ${'greater than'} | ${3}    | ${true}
    ${'equal to'}     | ${0}    | ${false}
  `('when the loading counter is $case 0', ({ loading, result }) => {
    it(`should return ${result}`, () => {
      expect.assertions(1);
      expect(getApiLoading({ ...testState, api: { ...testState.api, loading } })).toBe(result);
    });
  });

  describe('when there are optimistic updates', () => {
    const stateWithOptimisticUpdates: State = {
      ...testState,
      [PageListStandard.Food]: {
        ...testState[PageListStandard.Food],
        items: [
          {
            id: generateFakeId(),
            date: new Date(),
            item: 'Some item',
            category: 'Some category',
            cost: 123,
            shop: 'Some shop',
          },
        ],
        __optimistic: [RequestType.update],
      },
    };

    it('should return true', () => {
      expect.assertions(1);
      expect(getApiLoading(stateWithOptimisticUpdates)).toBe(true);
    });
  });
});
