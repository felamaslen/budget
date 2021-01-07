import { DatabaseTransactionConnectionType } from 'slonik';

import { getBroker, getFunds } from './process';
import * as queries from './queries';
import { Broker } from './types';

jest.mock('./queries');

describe('getBroker', () => {
  it.each`
    nameType           | name                                                    | broker
    ${'fund'}          | ${'HL Multi-Manager UK Growth (accum.)'}                | ${Broker.HL}
    ${'share'}         | ${'City of London Investment Trust ORD 25p (share)'}    | ${Broker.HL}
    ${'generic share'} | ${'Scottish Mortgage Investment Trust (SMT.L) (stock)'} | ${Broker.Generic}
  `('should return $broker for a $nameType', ({ name, broker }) => {
    expect.assertions(1);
    expect(getBroker(name)).toBe(broker);
  });

  it('throws an error for invalid fund names', () => {
    expect.assertions(1);
    expect(() => getBroker('foo')).toThrowErrorMatchingInlineSnapshot(`"Invalid fund name: foo"`);
  });
});

describe('getFunds', () => {
  const uid1 = Math.floor(Math.random() * 10000);
  const uid2 = Math.floor(Math.random() * 10000);

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
