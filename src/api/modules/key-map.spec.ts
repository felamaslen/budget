import { DJMap, mapInternalToExternal, mapExternalToInternal } from './key-map';

describe('mapInternalToExternal', () => {
  it('maps a database result to a deep javascript object', () => {
    expect.assertions(1);

    type DbResult = {
      foo_db: 'yes' | null;
      yas: string;
    };

    type JSResult = {
      foo: {
        bak: 'yes' | null;
      };
      yas: string;
    };

    const map: DJMap<DbResult> = [{ internal: 'foo_db', external: 'foo.bak' }];

    const dbResult: DbResult = {
      foo_db: 'yes',
      yas: 'no',
    };

    const result = mapInternalToExternal<DbResult, JSResult>(map)(dbResult);

    const expectedResult: JSResult = {
      foo: {
        bak: 'yes',
      },
      yas: 'no',
    };

    expect(result).toStrictEqual(expectedResult);
  });
});

describe('mapExternalToInternal', () => {
  it('maps a javascript object to a database row', () => {
    expect.assertions(1);
    type DbResult = {
      foo_db: 'yes' | null;
      bar_db: 'no' | null;
      baz: string | null;
    };

    type JSResult = {
      foo: {
        bak: 'yes' | null;
      };
      bar: 'no' | null;
      baz: string | null;
    };

    const map: DJMap<DbResult> = [
      { internal: 'foo_db', external: 'foo.bak' },
      { internal: 'bar_db', external: 'bar' },
    ];

    const jsObject: JSResult = {
      foo: {
        bak: 'yes',
      },
      bar: 'no',
      baz: null,
    };

    const result = mapExternalToInternal<DbResult, JSResult>(map)(jsObject);

    const expectedResult: DbResult = {
      foo_db: 'yes',
      bar_db: 'no',
      baz: null,
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
