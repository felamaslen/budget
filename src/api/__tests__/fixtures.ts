import Knex from 'knex';
import { generateUserPin } from '~api/test-utils/generate-user-pin';

export async function generateFunds(uid: number, db: Knex): Promise<void> {
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
      { time: '2014-10-14T17:01:01Z' },
      { time: '2015-02-03T15:30:01Z' },
      { time: '2015-08-29T15:30:01Z' },
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
      { cid: cids[4], fid: fids[0], price: 117.93 },
      { cid: cids[5], fid: fids[0], price: 119.27 },
      { cid: cids[6], fid: fids[0], price: 120.05 },
    ])
    .into('fund_cache');

  await db
    .insert([
      {
        fund_id: fundIds[0],
        date: '2014-10-13',
        units: 1005.2,
        price: 1139.92,
        fees: 10,
        taxes: 14,
      },
      {
        fund_id: fundIds[0],
        date: '2015-08-21',
        units: -1005.2,
        price: 1549.03,
        fees: 5,
        taxes: 204,
      },
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

export async function generateListData(uid: number, db: Knex): Promise<void> {
  await db
    .insert([
      { uid, date: '2015-04-18', item: 'Salary', cost: 365202 },
      { uid, date: '2018-03-24', item: 'Salary', cost: 433201 },
    ])
    .into('income');

  await db
    .insert([
      { uid, date: '2018-03-25', item: 'Rent', cost: 72500 },
      { uid, date: '2018-03-25', item: 'Electricity', cost: 3902 },
    ])
    .into('bills');

  await db
    .insert([
      {
        uid,
        date: '2015-05-07',
        shop: "Sainsbury's",
        category: 'Confectionery',
        item: 'Doughnuts',
        cost: 83,
      },
      {
        uid,
        date: '2015-05-03',
        shop: "Sainsbury's",
        category: 'Pastry',
        item: 'Danish pastry',
        cost: 156,
      },
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
      { uid, date: '2015-05-10', shop: 'Foo', category: 'Bar', item: 'Baz', cost: 7619 },
      { uid, date: '2018-03-25', shop: 'Amazon', category: 'Foo', item: 'Kitchen', cost: 1231 },
      {
        uid,
        date: '2018-03-25',
        shop: 'Hardware store',
        category: 'Foo',
        item: 'Household',
        cost: 9912,
      },
      {
        uid,
        date: new Date('2018-03-13'),
        item: 'Deposit',
        category: 'House purchase',
        cost: 5956000,
        shop: 'Some conveyancer',
      },
      {
        uid,
        date: new Date('2015-05-20'),
        item: 'Old Deposit',
        category: 'House purchase',
        cost: 12300000,
        shop: 'Other conveyancer',
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

export async function generateNetWorth(uid: number, db: Knex): Promise<void> {
  const [
    categoryIdCash,
    categoryIdLockedCash,
    categoryIdInvestments,
    categoryIdHouse,
    categoryIdOptions,
    categoryIdPension,
    categoryIdMortgage,
    categoryIdCC,
  ] = await db('net_worth_categories')
    .insert([
      {
        uid,
        type: 'asset',
        category: 'Cash',
        color: 'green',
        is_option: false,
      },
      {
        uid,
        type: 'asset',
        category: 'Cash (other)',
        color: 'teal',
        is_option: false,
      },
      {
        uid,
        type: 'asset',
        category: 'Stocks',
        color: 'teal',
        is_option: false,
      },
      {
        uid,
        type: 'asset',
        category: 'House',
        color: 'darkgreen',
        is_option: false,
      },
      {
        uid,
        type: 'asset',
        category: 'Options',
        color: 'turquoise',
        is_option: true,
      },
      {
        uid,
        type: 'asset',
        category: 'Pension',
        color: 'darkblue',
        is_option: true,
      },
      {
        uid,
        type: 'liability',
        category: 'Mortgage',
        color: 'darkred',
        is_option: null,
      },
      {
        uid,
        type: 'liability',
        category: 'Credit Cards',
        color: 'red',
        is_option: null,
      },
    ])
    .returning('id');

  const [
    subcategoryIdBank,
    subcategoryIdLockedCash,
    subcategoryIdForeignCash,
    subcategoryIdISA,
    subcategoryIdMyHouse,
    subcategoryIdMyOption,
    subcategoryIdMyPension,
    subcategoryIdMySAYE,
    subcategoryIdMyMortgage,
    subcategoryIdMyCC,
  ] = await db('net_worth_subcategories')
    .insert([
      {
        category_id: categoryIdCash,
        subcategory: 'Bank acount',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdLockedCash,
        subcategory: 'Money market funds',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdCash,
        subcategory: 'Foreign cash',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdInvestments,
        subcategory: 'My ISA',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdHouse,
        subcategory: '1 Some Place',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdOptions,
        subcategory: 'My option',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdPension,
        subcategory: 'My pension',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdOptions,
        subcategory: 'My SAYE',
        is_saye: true,
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdMortgage,
        subcategory: 'My mortgage',
        has_credit_limit: null,
        opacity: 1,
      },
      {
        category_id: categoryIdCC,
        subcategory: 'My credit card',
        has_credit_limit: true,
        opacity: 1,
      },
    ])
    .returning('id');

  const [entryIdOldest, entryIdOld] = await db('net_worth')
    .insert([
      {
        uid,
        date: new Date('2015-03-27'),
      },
      {
        uid,
        date: new Date('2015-05-31'),
      },
    ])
    .returning('id');

  await db('net_worth_credit_limit').insert({
    net_worth_id: entryIdOldest,
    subcategory: subcategoryIdMyCC,
    value: 600000,
  });

  await db('net_worth_currencies').insert([
    {
      net_worth_id: entryIdOldest,
      currency: 'CNY',
      rate: 0.113,
    },
    {
      net_worth_id: entryIdOld,
      currency: 'CNY',
      rate: 0.116,
    },
    {
      net_worth_id: entryIdOld,
      currency: 'USD',
      rate: 0.783,
    },
  ]);

  const [
    ,
    valueIdOldestFX,
    ,
    ,
    valueIdOldestOption,
    valueIdOldestSAYE,
    ,
    valueIdOldestMortgage,
    ,
    ,
    valueIdOldFX,
    ,
    valueIdOldOption,
    ,
    ,
    valueIdOldMortgage,
  ] = await db('net_worth_values')
    .insert([
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdBank,
        value: 1050000,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdForeignCash,
        value: null,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdLockedCash,
        value: 1667500,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdMyHouse,
        value: 42500000,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdMyOption,
        value: null,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdMySAYE,
        value: null,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdMyPension,
        value: 1054200,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdMyMortgage,
        value: -36125000,
        skip: null,
      },
      {
        net_worth_id: entryIdOldest,
        subcategory: subcategoryIdMyCC,
        value: -16532,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdBank,
        value: 996542,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdForeignCash,
        value: null,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdMyHouse,
        value: 43500000,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdMyOption,
        value: null,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdISA,
        value: 6354004,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdMyPension,
        value: 1117503,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdMyMortgage,
        value: -34713229,
        skip: null,
      },
      {
        net_worth_id: entryIdOld,
        subcategory: subcategoryIdMyCC,
        value: -12322,
        skip: null,
      },
    ])
    .returning('id');

  await db('net_worth_fx_values').insert([
    {
      values_id: valueIdOldestFX,
      currency: 'CNY',
      value: 62000,
    },
    {
      values_id: valueIdOldFX,
      currency: 'USD',
      value: 105,
    },
    {
      values_id: valueIdOldFX,
      currency: 'CNY',
      value: 57451,
    },
  ]);

  await db('net_worth_option_values').insert([
    {
      values_id: valueIdOldestOption,
      units: 165,
      vested: 149,
      strike_price: 112.83,
      market_price: 99.39,
    },
    {
      values_id: valueIdOldestSAYE,
      units: 1556,
      vested: 993,
      strike_price: 1350.3,
      market_price: 2113.7,
    },
    {
      values_id: valueIdOldOption,
      units: 1324,
      vested: 101,
      strike_price: 4.53,
      market_price: 19.27,
    },
  ]);

  await db('net_worth_mortgage_values').insert([
    {
      values_id: valueIdOldestMortgage,
      payments_remaining: 360,
      rate: 2.74,
    },
    {
      values_id: valueIdOldMortgage,
      payments_remaining: 358,
      rate: 2.71,
    },
  ]);
}

export async function seedUser(db: Knex): Promise<number> {
  await db('users').del();

  const { pinHash } = await generateUserPin(1234);

  const [uid] = await db('users')
    .insert({
      name: 'test-user',
      pin_hash: pinHash,
    })
    .returning('uid');

  return uid;
}

export async function seedData(uid: number, db: Knex): Promise<void> {
  await db('fund_scrape').del();
  await db('fund_cache_time').del();

  await db('net_worth').del();
  await db('net_worth_subcategories').del();
  await db('net_worth_categories').del();

  await db('income').del();
  await db('bills').del();
  await db('food').del();
  await db('general').del();
  await db('holiday').del();
  await db('social').del();

  await Promise.all([generateFunds(uid, db), generateListData(uid, db), generateNetWorth(uid, db)]);
}
