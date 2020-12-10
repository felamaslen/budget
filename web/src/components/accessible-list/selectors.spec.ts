import numericHash from 'string-hash';

import { getItems } from './selectors';
import { ApiListState } from '~client/selectors';
import { Id, RequestType } from '~client/types';

describe('Accessible list selectors', () => {
  describe('getItems', () => {
    type MyItem = {
      id: Id;
      item: string;
      foo: number;
    };

    const myPage = 'myPage';

    const myState: ApiListState<MyItem, typeof myPage> = {
      [myPage]: {
        items: [
          {
            id: numericHash('some-id'),
            item: 'yes',
            foo: 3,
          },
        ],
        __optimistic: [undefined],
      },
    };

    type MyState = typeof myState;

    it('should retrieve items from a crud state', () => {
      expect.assertions(1);
      expect(getItems(myPage)(myState)).toStrictEqual<MyItem[]>([
        {
          id: numericHash('some-id'),
          item: 'yes',
          foo: 3,
        },
      ]);
    });

    it('should memoise with respect to page', () => {
      expect.assertions(2);
      expect(getItems(myPage)).toBe(getItems(myPage));
      expect(getItems(myPage)).not.toBe(getItems('someotherpage'));
    });

    it('should memoise with respect to items', () => {
      expect.assertions(3);

      expect(getItems(myPage)(myState)).toBe(getItems(myPage)(myState));

      const stateWithOptimisticUpdate: MyState = {
        ...myState,
        [myPage]: {
          items: myState[myPage].items,
          __optimistic: [RequestType.update],
        },
      };

      expect(getItems(myPage)(stateWithOptimisticUpdate)).toBe(getItems(myPage)(myState));

      const stateWithChangedItem: MyState = {
        ...myState,
        [myPage]: {
          ...myState[myPage],
          items: [{ ...myState[myPage].items[0], foo: 4 }],
        },
      };

      expect(getItems(myPage)(stateWithChangedItem)).not.toBe(getItems(myPage)(myState));
    });
  });
});
