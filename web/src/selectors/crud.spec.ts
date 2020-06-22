import numericHash from 'string-hash';
import { getRequests, withoutDeleted } from './crud';
import { RequestType } from '~client/types';

describe('Crud selector', () => {
  describe('getRequests', () => {
    it('should get create requests', () => {
      expect.assertions(1);
      const state = {
        items: [
          {
            id: numericHash('some-fake-id'),
            foo: 'bar',
            bar: 'baz',
          },
        ],
        __optimistic: [RequestType.create],
      };

      const result = getRequests('my/url/something')(state);

      expect(result).toStrictEqual([
        {
          type: RequestType.create,
          fakeId: numericHash('some-fake-id'),
          method: 'post',
          route: 'my/url/something',
          body: {
            foo: 'bar',
            bar: 'baz',
          },
        },
      ]);
    });

    it('should get update requests', () => {
      expect.assertions(1);
      const state = {
        items: [
          {
            id: numericHash('some-real-id'),
            foo: 'bar',
            bar: 'baz',
          },
        ],
        __optimistic: [RequestType.update],
      };

      const result = getRequests('my/url/something')(state);

      expect(result).toStrictEqual([
        {
          type: RequestType.update,
          id: numericHash('some-real-id'),
          method: 'put',
          route: 'my/url/something',
          body: {
            foo: 'bar',
            bar: 'baz',
          },
        },
      ]);
    });

    it('should get delete requests', () => {
      expect.assertions(1);
      const state = {
        items: [
          {
            id: numericHash('some-real-id'),
          },
        ],
        __optimistic: [RequestType.delete],
      };

      const result = getRequests('my/url/something')(state);

      expect(result).toStrictEqual([
        {
          type: RequestType.delete,
          id: numericHash('some-real-id'),
          method: 'delete',
          route: 'my/url/something',
        },
      ]);
    });
  });

  describe('withoutDeleted', () => {
    it('should remove optimistically deleted items', () => {
      expect.assertions(1);
      expect(
        withoutDeleted({
          items: [
            { id: numericHash('1'), foo: 3 },
            { id: numericHash('2'), foo: 6 },
            { id: numericHash('3'), foo: 4 },
            { id: numericHash('4'), foo: 5 },
          ],
          __optimistic: [undefined, RequestType.delete, RequestType.create, RequestType.update],
        }),
      ).toStrictEqual([
        { id: numericHash('1'), foo: 3 },
        { id: numericHash('3'), foo: 4 },
        { id: numericHash('4'), foo: 5 },
      ]);
    });
  });
});
