import db from '~api/modules/db';
import { Broker } from './types';
import { getBroker, getFunds } from './process';

describe('getBroker', () => {
  const TEST_FUND_NAMES = [
    'HL Multi-Manager UK Growth (accum.)',
    'City of London Investment Trust ORD 25p (share)',
  ];

  it('returns HL for valid fund names', () => {
    expect(getBroker(TEST_FUND_NAMES[0])).toBe(Broker.HL);
    expect(getBroker(TEST_FUND_NAMES[1])).toBe(Broker.HL);
  });

  it('throws an error for invalid fund names', () => {
    expect(() => getBroker('foo')).toThrowError(/: foo/);
  });
});

describe('getFunds', () => {
  let fundIds: string[] = [];
  let uid1: string;
  let uid2: string;

  beforeAll(async () => {
    await db('users')
      .select()
      .del();
    await db('funds')
      .select()
      .del();

    [uid1] = await db('users')
      .insert({ name: 'test-user-1', pin_hash: 'some-pin-hash' })
      .returning('uid');
    [uid2] = await db('users')
      .insert({ name: 'test-user-2', pin_hash: 'other-pin-hash' })
      .returning('uid');

    fundIds = await db('funds')
      .insert([
        {
          uid: uid1,
          item: 'City of London Investment Trust ORD 25p (share)',
        },
        {
          uid: uid1,
          item: 'Jupiter Asian Income Class I (accum.)',
        },
        {
          uid: uid2,
          item: 'City of London Investment Trust ORD 25p (share)',
        },
        {
          uid: uid2,
          item: 'Apple Inc Com Stk NPV (share)',
        },
      ])
      .returning('id');

    await db('funds_transactions').insert([
      { fund_id: fundIds[0], date: '2016-08-24', units: 89.095, cost: 100000 },
      { fund_id: fundIds[0], date: '2016-09-19', units: 894.134, cost: 100000 },
      { fund_id: fundIds[0], date: '2017-04-27', units: -883.229, cost: -230000 },
      { fund_id: fundIds[1], date: '2016-11-10', units: 30, cost: 193 },
      { fund_id: fundIds[1], date: '2017-04-03', units: -30, cost: -203 },
      { fund_id: fundIds[2], date: '2016-08-07', units: 1032.19, cost: 560321 },
      { fund_id: fundIds[3], date: '2018-03-01', units: 14, cost: 243032 },
    ]);
  });

  afterAll(async () => {
    await db('users')
      .select()
      .where({ name: 'test-user-2' })
      .del();
  });

  it('should get the list of funds (separated by uid) with total units and costs', async () => {
    const result = await getFunds();

    expect(result).toHaveLength(3);

    const user1 = result.filter(({ uid: userId }) => userId === uid1);
    const user2 = result.filter(({ uid: userId }) => userId === uid2);

    expect(user1).toEqual([
      expect.objectContaining({
        uid: uid1,
        name: 'City of London Investment Trust ORD 25p (share)',
        broker: 'hl',
        units: 89.095 + 894.134 - 883.229,
        cost: 100000 + 100000 - 230000,
      }),
    ]);

    expect(user2).toEqual([
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
    ]);
  });

  it('should filter out funds with no held units', async () => {
    const result = await getFunds();

    // this fund has been completely sold
    expect(result.some(({ name }) => name === 'Jupiter Asian Income Class I (accum.)')).toBe(false);
  });

  it('should throw an error if one of the funds has an invalid name', async () => {
    const [badFundId] = await db('funds')
      .insert([
        {
          uid: uid1,
          item: 'Some invalid fund name',
        },
      ])
      .returning('id');

    await db('funds_transactions').insert([
      { fund_id: badFundId, date: '2016-09-19', units: 1678.42, cost: 200000 },
      { fund_id: badFundId, date: '2017-02-14', units: 846.38, cost: 100000 },
    ]);

    await expect(getFunds()).rejects.toThrowError(/: Some invalid fund name/);

    await db('funds')
      .where('id', badFundId)
      .del();
  });
});
