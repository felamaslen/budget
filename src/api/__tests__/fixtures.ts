import { DatabaseTransactionConnectionType, sql } from 'slonik';
import { withSlonik } from '~api/modules/db';
import { generateUserPin } from '~api/test-utils/generate-user-pin';
import { AsyncReturnType, PageListStandard } from '~api/types';
import { StandardRates, StandardThresholds } from '~shared/planning';

export const generateFunds = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<void> => {
  await db.query(sql`DELETE FROM funds`);
  await db.query(sql`DELETE FROM fund_scrape`);
  await db.query(sql`DELETE FROM fund_cache_time`);

  const fundIdsResult = await db.query<{ id: number }>(sql`
  INSERT INTO funds (uid, item)
  SELECT * FROM ${sql.unnest(
    [
      [uid, 'Scottish Mortgage Investment Trust (SMT.L) (stock)'],
      [uid, 'fund2'],
      [uid, 'fund3'],
    ],
    ['int4', 'text'],
  )}
  RETURNING id
  `);
  const fundIds = fundIdsResult.rows.map<number>((row) => row.id);

  const priceCacheIdsResult = await db.query<{ cid: number }>(sql`
  INSERT INTO fund_cache_time (time)
  SELECT * FROM ${sql.unnest(
    [
      ['2017-09-30T17:01:01Z'],
      ['2017-09-01T17:01:01Z'],
      ['2017-08-31T17:01:02Z'],
      ['2016-11-07T06:26:40Z'],
      ['2014-10-14T17:01:01Z'],
      ['2015-02-03T15:30:01Z'],
      ['2015-03-07T12:11:01Z'],
      ['2015-08-29T15:30:01Z'],
      ['2020-03-30T17:01:01Z'],
    ],
    ['timestamptz'],
  )}
  RETURNING cid
  `);
  const cids = priceCacheIdsResult.rows.map((row) => row.cid);

  const fundScrapeResult = await db.query<{ fid: number }>(sql`
  INSERT INTO fund_scrape (broker, item)
  SELECT * FROM ${sql.unnest(
    [
      ['generic', 'Scottish Mortgage Investment Trust (SMT.L) (stock)'],
      ['hl', 'fund2'],
      ['hl', 'fund3'],
    ],
    ['text', 'text'],
  )}
  RETURNING fid
  `);
  const fids = fundScrapeResult.rows.map((row) => row.fid);

  await db.query(sql`
  INSERT INTO fund_cache (cid, fid, price)
  SELECT * FROM ${sql.unnest(
    [
      [cids[1], fids[0], 124.04],
      [cids[1], fids[1], 95.49],
      [cids[1], fids[2], 49.52],
      [cids[2], fids[0], 123],
      [cids[2], fids[1], 100],
      [cids[2], fids[2], 50.97],
      [cids[3], fids[1], 95.3],
      [cids[4], fids[0], 117.93],
      [cids[5], fids[0], 119.27],
      [cids[6], fids[0], 119.27],
      [cids[7], fids[0], 120.05],
      [cids[8], fids[0], 127.39],
    ],
    ['int4', 'int4', 'float8'],
  )}
  `);

  await db.query(sql`
  INSERT INTO funds_transactions (fund_id, date, units, price, fees, taxes, is_drip, is_pension)
  SELECT * FROM ${sql.unnest(
    [
      [fundIds[0], '2014-10-13', 1005.2, 1139.92, 10, 14, false, false],
      [fundIds[0], '2015-08-21', -1005.2, 1549.03, 5, 204, false, false],
      [fundIds[0], '2015-09-02', 1004, 1497.32, 11, 54, false, true],
      [fundIds[2], '2016-09-19', 1678.42, 119.15, 16, 0, false, false],
      [fundIds[2], '2017-02-14', 846.38, 118.15, 0, 0, false, false],
      [fundIds[0], '2016-08-24', 89.095, 1122.3, 8, 0, false, false],
      [fundIds[0], '2016-09-19', 894.134, 111.84, 0, 0, false, false],
      [fundIds[0], '2017-04-27', -883.229, 101.898, 0, 0, false, false],
    ],
    ['int4', 'date', 'float8', 'float8', 'int4', 'int4', 'bool', 'bool'],
  )}
  `);
};

export const generateListData = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<void> => {
  await db.query(sql`DELETE FROM list_standard WHERE uid = ${uid}`);

  const incomeIdRows = await db.query<{ id: number }>(sql`
  INSERT INTO list_standard (uid, page, date, item, category, value, shop)
  SELECT * FROM ${sql.unnest(
    [
      [uid, PageListStandard.Income, '2015-04-18', 'Salary', 'Main job', 470242, 'My company'],
      [uid, PageListStandard.Income, '2018-03-24', 'Salary', 'Side work', 433201, 'Contract'],
      [uid, PageListStandard.Income, '2020-04-05', 'Salary', 'Side work', 15422, 'Contract'],
      [uid, PageListStandard.Income, '2020-04-11', 'Salary', 'Main job', 366729, 'My company'],
    ],
    ['int4', 'page_category', 'date', 'text', 'text', 'int4', 'text'],
  )}
  RETURNING id
  `);

  await db.query(sql`
  INSERT INTO income_deductions (list_id, name, value)
  SELECT * FROM ${sql.unnest(
    [
      [incomeIdRows.rows[0].id, 'Income tax', -105040],
      [incomeIdRows.rows[0].id, 'NI', -39872],
      [incomeIdRows.rows[1].id, 'VAT', -39765],
      [incomeIdRows.rows[1].id, 'Pension', -10520],
      [incomeIdRows.rows[2].id, 'Pension', -3629],
      [incomeIdRows.rows[2].id, 'VAT', -1550],
      [incomeIdRows.rows[3].id, 'NI', -41395],
    ],
    ['int4', 'text', 'int4'],
  )}
  `);

  await db.query(sql`
  INSERT INTO list_standard (uid, page, date, item, category, value, shop)
  SELECT * FROM ${sql.unnest(
    [
      [uid, PageListStandard.Bills, '2018-03-25', 'Rent', 'Housing', 72500, 'My bank'],
      [
        uid,
        PageListStandard.Bills,
        '2018-03-25',
        'Electricity',
        'Utilities',
        3902,
        'My energy company',
      ],
      [uid, PageListStandard.Food, '2015-05-07', 'Doughnuts', 'Confectionery', 83, "Sainsbury's"],
      [uid, PageListStandard.Food, '2015-05-03', 'Danish pastry', 'Pastry', 156, "Sainsbury's"],
      [uid, PageListStandard.Food, '2018-03-25', 'Breakfast', 'Food', 19239, 'Tesco'],
      [uid, PageListStandard.Food, '2018-03-25', 'Lunch', 'Food', 91923, 'Morrisons'],
      [uid, PageListStandard.Food, '2018-03-25', 'Nuts', 'Snacks', 2239, "Sainsbury's"],
      [uid, PageListStandard.Food, '2020-04-09', 'Sausages', 'Meat', 350, 'Tesco'],
      [uid, PageListStandard.General, '2015-05-10', 'Baz', 'Bar', 7619, 'Foo'],
      [uid, PageListStandard.General, '2018-03-25', 'Kitchen', 'Foo', 1231, 'Amazon'],
      [uid, PageListStandard.General, '2018-03-25', 'Household', 'Foo', 9912, 'Hardware store'],
      [
        uid,
        PageListStandard.General,
        '2018-03-13',
        'Deposit',
        'House purchase',
        5956000,
        'Some conveyancer',
      ],
      [
        uid,
        PageListStandard.General,
        '2015-05-20',
        'Old Deposit',
        'House purchase',
        12300000,
        'Other conveyancer',
      ],
      [uid, PageListStandard.Social, '2018-03-25', 'Friends', 'Bar', 61923, 'Some pub'],
      [
        uid,
        PageListStandard.Holiday,
        '2018-03-25',
        'Somewhere',
        'a country',
        11023,
        'Travel agents',
      ],
      [uid, PageListStandard.Holiday, '2018-03-25', 'Otherplace', 'a country', 23991, 'Skyscanner'],
    ],
    ['int4', 'page_category', 'date', 'text', 'text', 'int4', 'text'],
  )}
  `);
};

export const generateNetWorth = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<{
  subcategoryIds: {
    subcategoryIdBank: number;
    subcategoryIdLockedCash: number;
  };
}> => {
  await db.query(sql`DELETE FROM net_worth WHERE uid = ${uid}`);
  await db.query(sql`DELETE FROM net_worth_categories WHERE uid = ${uid}`);

  const {
    rows: [
      categoryIdCash,
      categoryIdLockedCash,
      categoryIdInvestments,
      categoryIdHouse,
      categoryIdOptions,
      categoryIdPension,
      categoryIdMortgage,
      categoryIdCC,
    ],
  } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth_categories (uid, type, category, color, is_option)
  SELECT * FROM ${sql.unnest(
    [
      [uid, 'asset', 'Cash (easy access)', 'green', false],
      [uid, 'asset', 'Cash (other)', 'teal', false],
      [uid, 'asset', 'Stocks', 'teal', false],
      [uid, 'asset', 'House', 'darkgreen', false],
      [uid, 'asset', 'Options', 'turquoise', true],
      [uid, 'asset', 'Pension', 'darkblue', true],
      [uid, 'liability', 'Mortgage', 'darkred', null],
      [uid, 'liability', 'Credit Cards', 'red', null],
    ],
    ['int4', 'text', 'text', 'text', 'bool'],
  )}
  RETURNING id
  `);

  const {
    rows: [
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
    ],
  } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth_subcategories (category_id, subcategory, has_credit_limit, is_saye, appreciation_rate, opacity)
  SELECT * FROM ${sql.unnest(
    [
      [categoryIdCash.id, 'Bank acount', null, null, null, 1],
      [categoryIdLockedCash.id, 'Money market funds', null, null, null, 1],
      [categoryIdCash.id, 'Foreign cash', null, null, null, 1],
      [categoryIdInvestments.id, 'My ISA', null, null, null, 1],
      [categoryIdHouse.id, '1 Some Place', null, null, 0.038, 1],
      [categoryIdOptions.id, 'My option', null, null, null, 1],
      [categoryIdPension.id, 'My pension', null, null, null, 1],
      [categoryIdOptions.id, 'My SAYE', null, true, null, 1],
      [categoryIdMortgage.id, 'My mortgage', null, null, null, 1],
      [categoryIdCC.id, 'My credit card', true, null, null, 1],
    ],
    ['int4', 'text', 'bool', 'bool', 'float8', 'float8'],
  )}
  RETURNING id
  `);

  const {
    rows: [entryIdOldest, entryIdOld, entryIdLastMonth],
  } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth (uid, date)
  SELECT * FROM ${sql.unnest(
    [
      [uid, '2015-03-27'],
      [uid, '2015-05-31'],
      [uid, '2020-03-31'],
    ],
    ['int4', 'date'],
  )}
  RETURNING id
  `);

  await db.query(sql`
  INSERT INTO net_worth_credit_limit (net_worth_id, subcategory, value)
  VALUES (${entryIdOldest.id}, ${subcategoryIdMyCC.id}, ${600000})
  `);

  await db.query(sql`
  INSERT INTO net_worth_currencies (net_worth_id, currency, rate)
  SELECT * FROM ${sql.unnest(
    [
      [entryIdOldest.id, 'CNY', 0.113],
      [entryIdOld.id, 'CNY', 0.116],
      [entryIdOld.id, 'USD', 0.783],
    ],
    ['int4', 'text', 'float8'],
  )}
  `);

  const {
    rows: [
      ,
      valueIdOldestFX,
      ,
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
    ],
  } = await db.query(sql`
  INSERT INTO net_worth_values (net_worth_id, subcategory, value, skip)
  SELECT * FROM ${sql.unnest(
    [
      [entryIdOldest.id, subcategoryIdBank.id, 1050000, null],
      [entryIdOldest.id, subcategoryIdForeignCash.id, null, null],
      [entryIdOldest.id, subcategoryIdLockedCash.id, 1667500, null],
      [entryIdOldest.id, subcategoryIdISA.id, 6338760, null],
      [entryIdOldest.id, subcategoryIdMyHouse.id, 42500000, null],
      [entryIdOldest.id, subcategoryIdMyOption.id, null, null],
      [entryIdOldest.id, subcategoryIdMySAYE.id, null, null],
      [entryIdOldest.id, subcategoryIdMyPension.id, 1054200, null],
      [entryIdOldest.id, subcategoryIdMyMortgage.id, -36125000, null],
      [entryIdOldest.id, subcategoryIdMyCC.id, -16532, null],
      [entryIdOld.id, subcategoryIdBank.id, 996542, null],
      [entryIdOld.id, subcategoryIdForeignCash.id, null, null],
      [entryIdOld.id, subcategoryIdMyHouse.id, 43500000, null],
      [entryIdOld.id, subcategoryIdMyOption.id, null, null],
      [entryIdOld.id, subcategoryIdISA.id, 6354004, null],
      [entryIdOld.id, subcategoryIdMyPension.id, 1117503, null],
      [entryIdOld.id, subcategoryIdMyMortgage.id, -34713229, null],
      [entryIdOld.id, subcategoryIdMyCC.id, -12322, null],
      [entryIdLastMonth.id, subcategoryIdISA.id, 6449962, null],
      [entryIdLastMonth.id, subcategoryIdBank.id, 1288520, null],
    ],
    ['int4', 'int4', 'int4', 'bool'],
  )}
  RETURNING id
  `);

  await db.query(sql`
  INSERT INTO net_worth_fx_values (values_id, currency, value)
  SELECT * FROM ${sql.unnest(
    [
      [valueIdOldestFX.id, 'CNY', 62000],
      [valueIdOldFX.id, 'USD', 105],
      [valueIdOldFX.id, 'CNY', 57451],
    ],
    ['int4', 'text', 'int4'],
  )}
  `);

  await db.query(sql`
  INSERT INTO net_worth_option_values (values_id, units, vested, strike_price, market_price)
  SELECT * FROM ${sql.unnest(
    [
      [valueIdOldestOption.id, 165, 149, 112.83, 99.39],
      [valueIdOldestSAYE.id, 1556, 993, 1350.3, 2113.7],
      [valueIdOldOption.id, 1324, 101, 4.53, 19.27],
    ],
    ['int4', 'int4', 'int4', 'float8', 'float8'],
  )}
  `);

  await db.query(sql`
  INSERT INTO net_worth_loan_values (values_id, payments_remaining, rate, paid)
  SELECT * FROM ${sql.unnest(
    [
      [valueIdOldestMortgage.id, 360, 2.74, 147692],
      [valueIdOldMortgage.id, 358, 2.71, 147687],
    ],
    ['int4', 'int4', 'float8', 'int4'],
  )};
  `);

  return {
    subcategoryIds: {
      subcategoryIdBank: subcategoryIdBank.id,
      subcategoryIdLockedCash: subcategoryIdLockedCash.id,
    },
  };
};

export const generatePlanning = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  subcategoryIds: AsyncReturnType<typeof generateNetWorth>['subcategoryIds'],
): Promise<void> => {
  await db.query(sql`DELETE FROM planning_rates`);
  await db.query(sql`DELETE FROM planning_thresholds`);

  const accountIdsResult = await db.query<{ id: number }>(sql`
  INSERT INTO planning_accounts (uid, account, net_worth_subcategory_id)
  SELECT * FROM ${sql.unnest(
    [
      [uid, 'Account A', subcategoryIds.subcategoryIdBank],
      [uid, 'Account B', subcategoryIds.subcategoryIdLockedCash],
    ],
    ['int4', 'text', 'int4'],
  )}
  RETURNING id
  `);
  const accountIds = accountIdsResult.rows.map((row) => row.id);

  await db.query(sql`
  INSERT INTO planning_income (account_id, start_date, end_date, salary, tax_code, pension_contrib, student_loan)
  SELECT * FROM ${sql.unnest(
    [
      [accountIds[0], '2018-03-10', '2020-04-30', 6600000, '1257L', 0.03, true],
      [accountIds[0], '2018-02-15', '2019-12-11', 3700000, '818L', 0.05, false],
    ],
    ['int4', 'date', 'date', 'int4', 'text', 'float8', 'bool'],
  )}
  `);

  await db.query(sql`
  INSERT INTO planning_rates (uid, year, name, value)
  SELECT * FROM ${sql.unnest(
    [
      [uid, 2018, StandardRates.IncomeTaxBasicRate, 0.2],
      [uid, 2018, StandardRates.IncomeTaxHigherRate, 0.4],
      [uid, 2018, StandardRates.IncomeTaxAdditionalRate, 0.45],
      [uid, 2018, StandardRates.NILowerRate, 0.12],
      [uid, 2018, StandardRates.NIHigherRate, 0.02],
      [uid, 2018, StandardRates.StudentLoanRate, 0.09],
      [uid, 2019, StandardRates.IncomeTaxBasicRate, 0.2],
      [uid, 2019, StandardRates.IncomeTaxHigherRate, 0.4],
      [uid, 2019, StandardRates.IncomeTaxAdditionalRate, 0.45],
      [uid, 2019, StandardRates.NILowerRate, 0.1325],
      [uid, 2019, StandardRates.NIHigherRate, 0.0325],
      [uid, 2019, StandardRates.StudentLoanRate, 0.09],
    ],
    ['int4', 'int4', 'text', 'float8'],
  )}
  `);

  await db.query(sql`
  INSERT INTO planning_thresholds (uid, year, name, value)
  SELECT * FROM ${sql.unnest(
    [
      [uid, 2018, StandardThresholds.IncomeTaxBasicAllowance, 3750000],
      [uid, 2018, StandardThresholds.IncomeTaxAdditionalThreshold, 15000000],
      [uid, 2018, StandardThresholds.NIPT, 79700],
      [uid, 2018, StandardThresholds.NIUEL, 418900],
      [uid, 2018, StandardThresholds.StudentLoanThreshold, 2500000],
      [uid, 2019, StandardThresholds.IncomeTaxBasicAllowance, 3750000],
      [uid, 2019, StandardThresholds.IncomeTaxAdditionalThreshold, 15000000],
      [uid, 2019, StandardThresholds.NIPT, 79700],
      [uid, 2019, StandardThresholds.NIUEL, 418900],
      [uid, 2019, StandardThresholds.StudentLoanThreshold, 2729500],
    ],
    ['int4', 'int4', 'text', 'float8'],
  )}
  `);
};

export const seedUser = withSlonik<number>(async (db) => {
  await db.query(sql`DELETE FROM users`);

  const { pinHash } = await generateUserPin(1234);

  const {
    rows: [{ uid }],
  } = await db.query<{ uid: number }>(sql`
  INSERT INTO users (name, pin_hash)
  VALUES (${'test-user'}, ${pinHash})
  RETURNING uid
  `);

  return uid;
});

export const seedData = withSlonik<void, [number]>(async (db, uid) => {
  const [, , netWorth] = await Promise.all([
    generateFunds(db, uid),
    generateListData(db, uid),
    generateNetWorth(db, uid),
  ]);
  await generatePlanning(db, uid, netWorth.subcategoryIds);
});
