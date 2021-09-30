import { omitDeep, optionalDeep } from './utils';

describe('Shared utils', () => {
  describe(omitDeep.name, () => {
    it('should remove the given key from an object, including arrays, recursively', () => {
      expect.assertions(1);
      expect(
        omitDeep(
          {
            foo: 'bar',
            id: 2,
            things: [{ bar: 'baz', id: 1 }, { bak: 'thing' }],
          },
          'id',
        ),
      ).toStrictEqual({
        foo: 'bar',
        things: [{ bar: 'baz' }, { bak: 'thing' }],
      });
    });
  });

  describe(optionalDeep.name, () => {
    it('should remove null values of the given key from an object, including arrays, recursively', () => {
      expect.assertions(1);
      expect(
        optionalDeep(
          {
            foo: 'bar',
            id: 2,
            things: [
              { bar: 'baz', id: 1 },
              { bak: 'thing', id: null },
              { fizz: 'buzz', id: undefined },
            ],
          },
          'id',
        ),
      ).toStrictEqual({
        foo: 'bar',
        id: 2,
        things: [{ bar: 'baz', id: 1 }, { bak: 'thing' }, { fizz: 'buzz', id: undefined }],
      });
    });
  });
});
