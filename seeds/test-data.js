const md5 = require('md5');
const { fundSalt } = require('../api/fund-salt.json');

const generateUserPin = require('../api/generate-user-pin');

async function generateFunds(uid, db) {
  const cids = await db('fund_cache_time')
    .insert([
      { time: '2017-09-30 17:01:01', done: true },
      { time: '2017-09-01 17:01:01', done: true },
      { time: '2017-08-31 17:01:02', done: true },
      { time: '2016-12-03 11:30:00', done: false },
      { time: '2016-11-07 06:26:40', done: true },
    ])
    .returning('cid');

  const fids = await db('fund_hash')
    .insert([
      { broker: 'hl', hash: md5(`fund1${fundSalt}`) },
      { broker: 'hl', hash: md5(`fund2${fundSalt}`) },
      { broker: 'hl', hash: md5(`fund3${fundSalt}`) },
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
      { cid: cids[3], fid: fids[0], price: 121.99 },
      { cid: cids[3], fid: fids[1], price: 99.13 },
      { cid: cids[3], fid: fids[2], price: 56.01 },
      { cid: cids[4], fid: fids[1], price: 95.3 },
    ])
    .into('fund_cache');

  // 11, 1, 3
  const fundIds = await db
    .insert([
      { uid, item: 'fund1' },
      { uid, item: 'fund2' },
      { uid, item: 'fund3' },
    ])
    .returning('id')
    .into('funds');

  await db
    .insert([
      { fund_id: fundIds[2], date: '2016-09-19', units: 1678.42, cost: 200000 },
      { fund_id: fundIds[2], date: '2017-02-14', units: 846.38, cost: 100000 },
      { fund_id: fundIds[0], date: '2016-08-24', units: 89.095, cost: 100000 },
      { fund_id: fundIds[0], date: '2016-09-19', units: 894.134, cost: 100000 },
      { fund_id: fundIds[0], date: '2017-04-27', units: -883.229, cost: -90000 },
    ])
    .into('funds_transactions');
}

async function generateListData(uid, db) {
  await db.insert([{ uid, date: '2018-03-24', item: 'Salary', cost: 433201 }]).into('income');

  await db
    .insert([
      { uid, date: '2018-03-25', item: 'Rent', cost: 72500 },
      { uid, date: '2018-03-25', item: 'Electricity', cost: 3902 },
    ])
    .into('bills');

  await db
    .insert([
      { uid, date: '2018-03-25', shop: '', category: 'Food', item: 'Breakfast', cost: 19239 },
      { uid, date: '2018-03-25', shop: '', category: 'Food', item: 'Lunch', cost: 91923 },
      { uid, date: '2018-03-25', shop: '', category: 'Snacks', item: 'Nuts', cost: 2239 },
    ])
    .into('food');

  await db
    .insert([
      { uid, date: '2018-03-25', shop: '', category: 'Foo', item: 'Kitchen', cost: 1231 },
      { uid, date: '2018-03-25', shop: '', category: 'Foo', item: 'Household', cost: 9912 },
    ])
    .into('general');

  await db
    .insert([
      { uid, date: '2018-03-25', shop: '', holiday: 'a country', item: 'Somewhere', cost: 11023 },
      { uid, date: '2018-03-25', shop: '', holiday: 'a country', item: 'Otherplace', cost: 23991 },
    ])
    .into('holiday');

  await db
    .insert([{ uid, date: '2018-03-25', shop: '', society: 'Bar', item: 'Friends', cost: 61923 }])
    .into('social');
}

async function seed(db) {
  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  await db('users')
    .select()
    .del();

  await db('fund_hash')
    .select()
    .del();

  const { pinHash } = await generateUserPin('1234');

  const [uid] = await db('users')
    .insert({
      name: 'test-user',
      pin_hash: pinHash,
    })
    .returning('uid');

  await Promise.all([generateFunds(uid, db), generateListData(uid, db)]);
}

module.exports = { seed };
