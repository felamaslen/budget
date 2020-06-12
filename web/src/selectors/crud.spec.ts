import { getRequests } from './crud';
import { RequestType } from '~client/types';

describe('Crud selector', () => {
  describe('getRequests', () => {
    it('should get create requests', () => {
      expect.assertions(1);
      const items = [
        {
          id: 'some-fake-id',
          foo: 'bar',
          bar: 'baz',
          __optimistic: RequestType.create,
        },
      ];

      const result = getRequests('my/url/something')(items);

      expect(result).toStrictEqual([
        {
          type: RequestType.create,
          fakeId: 'some-fake-id',
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
      const items = [
        {
          id: 'some-real-id',
          foo: 'bar',
          bar: 'baz',
          __optimistic: RequestType.update,
        },
      ];

      const result = getRequests('my/url/something')(items);

      expect(result).toStrictEqual([
        {
          type: RequestType.update,
          id: 'some-real-id',
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
      const items = [
        {
          id: 'some-real-id',
          __optimistic: RequestType.delete,
        },
      ];

      const result = getRequests('my/url/something')(items);

      expect(result).toStrictEqual([
        {
          type: RequestType.delete,
          id: 'some-real-id',
          method: 'delete',
          route: 'my/url/something',
        },
      ]);
    });
  });
});
