import numericHash from 'string-hash';
import { onCreateOptimistic, onUpdateOptimistic, onDeleteOptimistic, State } from './crud';
import type { Id } from '~client/types';
import { RequestType } from '~client/types/enum';

describe('CRUD reducer helpers', () => {
  type ReadItem = {
    id: Id;
    foo: string;
    bar: number;
  };

  type CreateItem = {
    foo: string;
    bar?: number;
  };

  const stateEmpty: State<ReadItem> = {
    items: [],
    __optimistic: [],
  };

  const stateNormal: State<ReadItem> = {
    items: [
      {
        id: numericHash('my-real-id'),
        foo: 'some foo',
        bar: 3,
      },
    ],
    __optimistic: [undefined],
  };

  const stateCreating: State<ReadItem> = {
    items: [
      {
        id: numericHash('my-fake-id'),
        foo: 'some foo',
        bar: 3,
      },
    ],
    __optimistic: [RequestType.create],
  };

  const stateUpdating: State<ReadItem> = {
    items: [
      {
        id: numericHash('my-real-id'),
        foo: 'updated foo',
        bar: 4,
      },
    ],
    __optimistic: [RequestType.update],
  };

  const stateDeleting: State<ReadItem> = {
    items: [
      {
        id: numericHash('my-real-id'),
        foo: 'some foo',
        bar: 3,
      },
    ],
    __optimistic: [RequestType.delete],
  };

  describe(onCreateOptimistic.name, () => {
    describe('when the original fake ID is undefined', () => {
      it('should add the item optimistically to the state', () => {
        expect.assertions(1);
        const result = onCreateOptimistic<CreateItem, ReadItem>(
          stateEmpty,
          numericHash('some-fake-id'),
          {
            foo: 'some foo',
            bar: 3,
          },
          undefined,
        );

        expect(result).toStrictEqual<State<ReadItem>>({
          items: [
            {
              id: numericHash('some-fake-id'),
              foo: 'some foo',
              bar: 3,
            },
          ],
          __optimistic: [RequestType.create],
        });
      });
    });

    describe('when the original fake ID is defined', () => {
      describe('when the original fake ID is present in the state with an optimistic create status', () => {
        it('should confirm the created item', () => {
          expect.assertions(1);
          const result = onCreateOptimistic<CreateItem, ReadItem>(
            stateCreating,
            numericHash('some-real-id'),
            {
              foo: 'some foo',
              bar: 3,
            },
            numericHash('my-fake-id'),
          );

          expect(result).toStrictEqual<State<ReadItem>>({
            items: [
              {
                id: numericHash('some-real-id'),
                foo: 'some foo',
                bar: 3,
              },
            ],
            __optimistic: [undefined],
          });
        });
      });

      describe('when the original fake ID is not present in the state', () => {
        it('should add the item to the state', () => {
          expect.assertions(1);
          const result = onCreateOptimistic<CreateItem, ReadItem>(
            stateEmpty,
            numericHash('some-real-id'),
            {
              foo: 'some foo',
              bar: 3,
            },
            numericHash('some-fake-id'),
          );

          expect(result).toStrictEqual<State<ReadItem>>({
            items: [
              {
                id: numericHash('some-real-id'),
                foo: 'some foo',
                bar: 3,
              },
            ],
            __optimistic: [undefined],
          });
        });
      });
    });
  });

  describe(onUpdateOptimistic.name, () => {
    it('should optimistically update an item', () => {
      expect.assertions(1);
      const result = onUpdateOptimistic<CreateItem, ReadItem>(
        stateNormal,
        numericHash('my-real-id'),
        {
          foo: 'updated foo',
          bar: 4,
        },
        false,
      );

      expect(result).toStrictEqual<State<ReadItem>>({
        items: [
          {
            id: numericHash('my-real-id'),
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
        const result = onUpdateOptimistic<CreateItem, ReadItem>(
          stateCreating,
          numericHash('my-fake-id'),
          {
            foo: 'updated foo',
          },
          false,
        );

        expect(result).toStrictEqual<State<ReadItem>>({
          items: [
            {
              id: numericHash('my-fake-id'),
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
        const result = onUpdateOptimistic<CreateItem, ReadItem>(
          stateDeleting,
          numericHash('my-real-id'),
          {
            foo: 'updated foo',
          },
          false,
        );

        expect(result).toBe(stateDeleting);
      });
    });

    describe('when the item has not changed', () => {
      it('should not alter the state', () => {
        expect.assertions(1);
        const result = onUpdateOptimistic<CreateItem, ReadItem>(
          stateNormal,
          numericHash('my-real-id'),
          {
            foo: 'some foo',
          },
          false,
        );

        expect(result).toBe(stateNormal);
      });
    });

    describe('when initiated from the server', () => {
      it('should confirm an optimistic update', () => {
        expect.assertions(1);

        const result = onUpdateOptimistic<CreateItem, ReadItem>(
          stateUpdating,
          numericHash('my-real-id'),
          {
            foo: 'updated foo',
            bar: 4,
          },
          true,
        );

        expect(result).toStrictEqual({
          items: [{ id: numericHash('my-real-id'), foo: 'updated foo', bar: 4 }],
          __optimistic: [undefined],
        });
      });

      describe('when the item has not been updated locally', () => {
        it('should apply the update', () => {
          expect.assertions(1);

          const result = onUpdateOptimistic<CreateItem, ReadItem>(
            stateNormal,
            numericHash('my-real-id'),
            {
              foo: 'updated foo',
              bar: 4,
            },
            true,
          );

          expect(result).toStrictEqual({
            items: [{ id: numericHash('my-real-id'), foo: 'updated foo', bar: 4 }],
            __optimistic: [undefined],
          });
        });
      });
    });
  });

  describe('onDeleteOptimistic', () => {
    it('should optimistically delete an item', () => {
      expect.assertions(1);
      const result = onDeleteOptimistic<ReadItem>(stateNormal, numericHash('my-real-id'), false);

      expect(result).toStrictEqual({
        items: [
          {
            id: numericHash('my-real-id'),
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
        const result = onDeleteOptimistic<ReadItem>(
          stateCreating,
          numericHash('my-fake-id'),
          false,
        );

        expect(result).toStrictEqual({ items: [], __optimistic: [] });
      });
    });

    describe('when the item is pending update', () => {
      it('should optimistically delete the item', () => {
        expect.assertions(1);
        const result = onDeleteOptimistic<ReadItem>(
          stateUpdating,
          numericHash('my-real-id'),
          false,
        );

        expect(result).toStrictEqual({
          items: [
            {
              id: numericHash('my-real-id'),
              foo: 'updated foo',
              bar: 4,
            },
          ],
          __optimistic: [RequestType.delete],
        });
      });
    });

    describe('when initiated from the server', () => {
      describe.each`
        case                                  | state
        ${'the item is pending deletion'}     | ${stateDeleting}
        ${'the item is not pending deletion'} | ${stateNormal}
      `('when $case', ({ state }) => {
        it('should remove the item from the state, along with its optimistic status', () => {
          expect.assertions(1);
          const result = onDeleteOptimistic<ReadItem>(state, numericHash('my-real-id'), true);

          expect(result).toStrictEqual({
            items: [],
            __optimistic: [],
          });
        });
      });
    });
  });
});
