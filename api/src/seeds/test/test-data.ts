import Knex from 'knex';

import { generateUserPin } from '~api/test-utils/generate-user-pin';

async function generateFunds(uid: number, db: Knex): Promise<void> {
  const fundIds = await db
    .insert([
      { uid, item: 'fund1' },
      { uid, item: 'fund2' },
      { uid, item: 'fund3' },
    ])
    .returning('id')
    .into('funds');

  const cids = await db('fund_cache_time')
    .insert([
      { time: '2017-09-30T17:01:01Z' },
      { time: '2017-09-01T17:01:01Z' },
      { time: '2017-08-31T17:01:02Z' },
      { time: '2016-11-07T06:26:40Z' },
    ])
    .returning('cid');

  const fids = await db('fund_scrape')
    .insert([
      { broker: 'hl', item: 'fund1' },
      { broker: 'hl', item: 'fund2' },
      { broker: 'hl', item: 'fund3' },
    ])
    .returning('fid');

  await db
    .insert([
      { cid: cids[1], fid: fids[0], price: 124.04 },
      { cid: cids[1], fid: fids[1], price: 95.49 },
      { cid: cids[1], fid: fids[2], price: 49.52 },
      { cid: cids[2], fid: fids[0], price: 123 },
      { cid: cids[2], fid: fids[1], price: 100 },
      { cid: cids[2], fid: fids[2], price: 50.97 },
      { cid: cids[3], fid: fids[1], price: 95.3 },
    ])
    .into('fund_cache');

  await db
    .insert([
      {
        fund_id: fundIds[2],
        date: '2016-09-19',
        units: 1678.42,
        price: 119.15,
        fees: 16,
        taxes: 0,
      },
      {
        fund_id: fundIds[2],
        date: '2017-02-14',
        units: 846.38,
        price: 118.15,
        fees: 0,
        taxes: 0,
      },
      {
        fund_id: fundIds[0],
        date: '2016-08-24',
        units: 89.095,
        price: 1122.3,
        fees: 8,
        taxes: 0,
      },
      {
        fund_id: fundIds[0],
        date: '2016-09-19',
        units: 894.134,
        price: 111.84,
        fees: 0,
        taxes: 0,
      },
      {
        fund_id: fundIds[0],
        date: '2017-04-27',
        units: -883.229,
        price: 101.898,
        fees: 0,
        taxes: 0,
      },
    ])
    .into('funds_transactions');
}

async function generateListData(uid: number, db: Knex): Promise<void> {
  await db.insert([{ uid, date: '2018-03-24', item: 'Salary', cost: 433201 }]).into('income');

  await db
    .insert([
      { uid, date: '2018-03-25', item: 'Rent', cost: 72500 },
      { uid, date: '2018-03-25', item: 'Electricity', cost: 3902 },
    ])
    .into('bills');

  await db
    .insert([
      { uid, date: '2018-03-25', shop: 'Tesco', category: 'Food', item: 'Breakfast', cost: 19239 },
      { uid, date: '2018-03-25', shop: 'Morrisons', category: 'Food', item: 'Lunch', cost: 91923 },
      {
        uid,
        date: '2018-03-25',
        shop: "Sainsbury's",
        category: 'Snacks',
        item: 'Nuts',
        cost: 2239,
      },
    ])
    .into('food');

  await db
    .insert([
      { uid, date: '2018-03-25', shop: 'Amazon', category: 'Foo', item: 'Kitchen', cost: 1231 },
      {
        uid,
        date: '2018-03-25',
        shop: 'Hardware store',
        category: 'Foo',
        item: 'Household',
        cost: 9912,
      },
    ])
    .into('general');

  await db
    .insert([
      {
        uid,
        date: '2018-03-25',
        shop: 'Travel agents',
        category: 'a country',
        item: 'Somewhere',
        cost: 11023,
      },
      {
        uid,
        date: '2018-03-25',
        shop: 'Skyscanner',
        category: 'a country',
        item: 'Otherplace',
        cost: 23991,
      },
    ])
    .into('holiday');

  await db
    .insert([
      { uid, date: '2018-03-25', shop: 'Some pub', category: 'Bar', item: 'Friends', cost: 61923 },
    ])
    .into('social');
}

async function generateNetWorth(uid: number, db: Knex): Promise<void> {
  const [categoryId] = await db('net_worth_categories')
    .insert([
      {
        uid,
        type: 'asset',
        category: 'Cash',
        color: '#0f0',
        is_option: false,
      },
    ])
    .returning('id');

  const [subcategoryId] = await db('net_worth_subcategories')
    .insert([
      {
        category_id: categoryId,
        subcategory: 'Bank acount',
        has_credit_limit: null,
        opacity: 1,
      },
    ])
    .returning('id');

  const [entryId] = await db('net_worth')
    .insert([
      {
        uid,
        date: new Date('2016-02-27'),
      },
    ])
    .returning('id');

  await db('net_worth_values').insert([
    {
      net_worth_id: entryId,
      subcategory: subcategoryId,
      value: 450564,
      skip: null,
    },
  ]);
}

export async function seed(db: Knex): Promise<void> {
  await db('users').del();
  await db('fund_scrape').del();
  await db('fund_cache_time').del();

  const { pinHash } = await generateUserPin(1234);

  const [uid] = await db('users')
    .insert({
      name: 'test-user',
      pin_hash: pinHash,
    })
    .returning('uid');

  await Promise.all([generateFunds(uid, db), generateListData(uid, db), generateNetWorth(uid, db)]);
}
