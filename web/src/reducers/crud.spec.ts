import { onCreateOptimistic, onUpdateOptimistic, onDeleteOptimistic, State } from './crud';
import { RequestType } from '~client/types/crud';

describe('CRUD reducer helpers', () => {
  type Item = {
    id: string;
    foo: string;
    bar: number;
  };

  const stateEmpty: State<Item> = {
    items: [],
    __optimistic: [],
  };

  const stateNormal: State<Item> = {
    items: [
      {
        id: 'my-real-id',
        foo: 'some foo',
        bar: 3,
      },
    ],
    __optimistic: [undefined],
  };

  const stateCreating: State<Item> = {
    items: [
      {
        id: 'my-fake-id',
        foo: 'some foo',
        bar: 3,
      },
    ],
    __optimistic: [RequestType.create],
  };

  const stateUpdating: State<Item> = {
    items: [
      {
        id: 'my-real-id',
        foo: 'updated foo',
        bar: 4,
      },
    ],
    __optimistic: [RequestType.update],
  };

  const stateDeleting: State<Item> = {
    items: [
      {
        id: 'my-real-id',
        foo: 'some foo',
        bar: 3,
      },
    ],
    __optimistic: [RequestType.delete],
  };

  describe('onCreateOptimistic', () => {
    it('should add an optimistically created item', () => {
      expect.assertions(1);
      const result = onCreateOptimistic<Item>(stateEmpty, 'some-fake-id', {
        foo: 'some foo',
        bar: 3,
      });

      expect(result).toStrictEqual({
        items: [
          {
            id: 'some-fake-id',
            foo: 'some foo',
            bar: 3,
          },
        ],
        __optimistic: [RequestType.create],
      });
    });
  });

  describe('onUpdateOptimistic', () => {
    it('should optimistically update an item', () => {
      expect.assertions(1);
      const result = onUpdateOptimistic<Item>(stateNormal, 'my-real-id', {
        foo: 'updated foo',
        bar: 4,
      });

      expect(result).toStrictEqual({
        items: [
          {
            id: 'my-real-id',
            foo: 'updated foo',
            bar: 4,
          },
        ],
        __optimistic: [RequestType.update],
      });
    });

    describe('when the item is pending creation', () => {
      it('should not change the request type', () => {
        expect.assertions(1);
        const result = onUpdateOptimistic<Item>(stateCreating, 'my-fake-id', {
          foo: 'updated foo',
        });

        expect(result).toStrictEqual({
          items: [
            {
              id: 'my-fake-id',
              foo: 'updated foo',
              bar: 3,
            },
          ],
          __optimistic: [RequestType.create],
        });
      });
    });

    describe('when the item is pending deletion', () => {
      it('should not alter the state', () => {
        expect.assertions(1);
        const result = onUpdateOptimistic<Item>(stateDeleting, 'my-real-id', {
          foo: 'updated foo',
        });

        expect(result).toBe(stateDeleting);
      });
    });

    describe('when the item has not changed', () => {
      it('should not alter the state', () => {
        expect.assertions(1);
        const result = onUpdateOptimistic<Item>(stateNormal, 'my-real-id', {
          foo: 'some foo',
        });

        expect(result).toBe(stateNormal);
      });
    });
  });

  describe('onDeleteOptimistic', () => {
    it('should optimistically delete an item', () => {
      expect.assertions(1);
      const result = onDeleteOptimistic<Item>(stateNormal, 'my-real-id');

      expect(result).toStrictEqual({
        items: [
          {
            id: 'my-real-id',
            foo: 'some foo',
            bar: 3,
          },
        ],
        __optimistic: [RequestType.delete],
      });
    });

    describe('when the item is pending creation', () => {
      it('should remove the item from state', () => {
        expect.assertions(1);
        const result = onDeleteOptimistic<Item>(stateCreating, 'my-fake-id');

        expect(result).toStrictEqual({ items: [], __optimistic: [] });
      });
    });

    describe('when the item is pending update', () => {
      it('should optimistically delete the item', () => {
        expect.assertions(1);
        const result = onDeleteOptimistic<Item>(stateUpdating, 'my-real-id');

        expect(result).toStrictEqual({
          items: [
            {
              id: 'my-real-id',
              foo: 'updated foo',
              bar: 4,
            },
          ],
          __optimistic: [RequestType.delete],
        });
      });
    });
  });
});
