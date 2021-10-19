import numericHash from 'string-hash';
import { withoutDeleted } from './crud';
import { RequestType } from '~client/types/enum';

describe('crud selector', () => {
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
