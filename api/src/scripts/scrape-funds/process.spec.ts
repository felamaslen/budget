import { DatabaseTransactionConnectionType } from 'slonik';
import uuidv4 from 'uuid/v4';

import { getBroker, getFunds } from './process';
import * as queries from './queries';
import { Broker } from './types';

jest.mock('./queries');

describe('getBroker', () => {
  const TEST_FUND_NAMES = [
    'HL Multi-Manager UK Growth (accum.)',
    'City of London Investment Trust ORD 25p (share)',
  ];

  it('returns HL for valid fund names', () => {
    expect.assertions(2);
    expect(getBroker(TEST_FUND_NAMES[0])).toBe(Broker.HL);
    expect(getBroker(TEST_FUND_NAMES[1])).toBe(Broker.HL);
  });

  it('throws an error for invalid fund names', () => {
    expect.assertions(1);
    expect(() => getBroker('foo')).toThrowErrorMatchingInlineSnapshot(`"Invalid fund name: foo"`);
  });
});

describe('getFunds', () => {
  const uid1 = uuidv4();
  const uid2 = uuidv4();

  const db = {} as DatabaseTransactionConnectionType;

  const mockFunds = [
    {
      uid: uid1,
      name: 'City of London Investment Trust ORD 25p (share)',
      units: 89.095 + 894.134 - 883.229,
      cost: 100000 + 100000 - 230000,
    },
    {
      uid: uid2,
      name: 'City of London Investment Trust ORD 25p (share)',
      units: 1032.19,
      cost: 560321,
    },
    { uid: uid2, name: 'Apple Inc Com Stk NPV (share)', units: 14, cost: 243032 },
  ];

  let selectFundsSpy: jest.SpyInstance;

  beforeEach(() => {
    selectFundsSpy = jest.spyOn(queries, 'selectFunds').mockResolvedValueOnce(mockFunds);
  });

  it('should get the list of funds (separated by uid) with total units and costs', async () => {
    expect.assertions(3);
    const result = await getFunds(db);

    expect(result).toHaveLength(3);

    const user1 = result.filter(({ uid: userId }) => userId === uid1);
    const user2 = result.filter(({ uid: userId }) => userId === uid2);

    expect(user1).toStrictEqual([
      expect.objectContaining({
        uid: uid1,
        name: 'City of London Investment Trust ORD 25p (share)',
        broker: 'hl',
        units: 89.095 + 894.134 - 883.229,
        cost: 100000 + 100000 - 230000,
      }),
    ]);

    expect(user2).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uid: uid2,
          name: 'Apple Inc Com Stk NPV (share)',
          broker: 'hl',
          units: 14,
          cost: 243032,
        }),
        expect.objectContaining({
          uid: uid2,
          name: 'City of London Investment Trust ORD 25p (share)',
          broker: 'hl',
          units: 1032.19,
          cost: 560321,
        }),
      ]),
    );
  });

  it('should throw an error if one of the funds has an invalid name', async () => {
    expect.assertions(1);
    selectFundsSpy.mockRestore();
    selectFundsSpy = jest.spyOn(queries, 'selectFunds').mockResolvedValueOnce([
      ...mockFunds,
      {
        uid: uid1,
        name: 'Some invalid fund name',
        units: 1678.42 + 846.38,
        cost: 200000 + 100000,
      },
    ]);

    await expect(getFunds(db)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid fund name: Some invalid fund name"`,
    );
  });
});
