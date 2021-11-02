import { FetchResult } from 'apollo-boost';
import gql from 'graphql-tag';
import { omit } from 'lodash';
import sinon from 'sinon';
import { DatabasePoolConnectionType, sql } from 'slonik';

import { getPool } from '~api/modules/db';
import {
  AccountRow,
  PlanningCreditCardPaymentRow,
  PlanningCreditCardRow,
  PlanningIncomeRow,
  PlanningValueRow,
  RateRow,
  ThresholdRow,
} from '~api/queries/planning';
import { App, getTestApp } from '~api/test-utils/create-server';
import { Maybe, MutationSyncPlanningArgs, PageListStandard } from '~api/types';
import {
  PlanningAccount,
  PlanningAccountInput,
  PlanningComputedValue,
  PlanningCreditCard,
  PlanningCreditCardPayment,
  PlanningIncome,
  PlanningParameters,
  PlanningSyncResponse,
  PlanningValue,
  TaxRate,
  TaxThreshold,
} from '~client/types/gql';
import type { RawDateDeep } from '~shared/types';
import { omitTypeName } from '~shared/utils';

describe('planning resolver', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  const myYear = 2020;

  const myNetWorthCategory = 'My net worth category';
  const myBank = 'My net worth bank subcategory';
  const myOtherBank = 'My other bank subcategory';
  const myCreditCard = 'My net worth credit card subcategory';
  let myBankId: number;
  let myOtherBankId: number;
  let myCreditCardId: number;

  const myBankValueJan2020 = 300000;
  const myOtherBankValueJan2020 = 500000;

  type MutationSyncPlanningArgsRawDate = RawDateDeep<
    MutationSyncPlanningArgs,
    'startDate' | 'endDate'
  >;

  const setupInitialData = async (db: DatabasePoolConnectionType): Promise<void> => {
    await db.query(sql`DELETE FROM planning_accounts`);
    await db.query(sql`DELETE FROM planning_rates`);
    await db.query(sql`DELETE FROM planning_thresholds`);

    await db.query(sql`DELETE FROM net_worth_categories WHERE category = ${myNetWorthCategory}`);
    await db.query(sql`DELETE FROM net_worth WHERE uid = ${app.uid}`);
    await db.query(sql`DELETE FROM list_standard WHERE page = ${PageListStandard.Income}`);

    const categoryInsertResult = await db.query<{ id: number }>(sql`
    INSERT INTO net_worth_categories (uid, type, category)
    VALUES (${app.uid}, ${'asset'}, ${myNetWorthCategory})
    RETURNING id
    `);

    const subcategoryInsertResult = await db.query<{ id: number }>(sql`
    INSERT INTO net_worth_subcategories (category_id, subcategory)
    VALUES ${sql.join(
      [
        sql`(${categoryInsertResult.rows[0].id}, ${myBank})`,
        sql`(${categoryInsertResult.rows[0].id}, ${myOtherBank})`,
        sql`(${categoryInsertResult.rows[0].id}, ${myCreditCard})`,
      ],
      sql`, `,
    )}
    RETURNING id
    `);

    myBankId = subcategoryInsertResult.rows[0].id;
    myOtherBankId = subcategoryInsertResult.rows[1].id;
    myCreditCardId = subcategoryInsertResult.rows[2].id;

    const netWorthEntryInsertResult = await db.query<{ id: number }>(sql`
    INSERT INTO net_worth (uid, date) VALUES (${app.uid}, ${'2020-01-31'}) RETURNING id
    `);
    const netWorthEntryId = netWorthEntryInsertResult.rows[0].id;

    await db.query(sql`
    INSERT INTO net_worth_values (net_worth_id, subcategory, value, skip)
    VALUES
    (${netWorthEntryId}, ${myBankId}, ${myBankValueJan2020}, ${false})
    ,(${netWorthEntryId}, ${myOtherBankId}, ${myOtherBankValueJan2020}, ${false})
    `);

    const incomeIdRows = await db.query<{ id: number }>(sql`
    INSERT INTO list_standard (uid, page, date, item, category, value, shop)
    SELECT * FROM ${sql.unnest(
      [
        [
          app.uid,
          PageListStandard.Income,
          '2020-04-20',
          'Salary (Something account)',
          'Work',
          500000,
          'Some company',
        ],
        [
          app.uid,
          PageListStandard.Income,
          '2020-05-14',
          'Salary (Something account)',
          'Work',
          510000,
          'Some company',
        ],
      ],
      ['int4', 'page_category', 'date', 'text', 'text', 'int4', 'text'],
    )}
    RETURNING id
    `);

    await db.query(sql`
    INSERT INTO income_deductions (list_id, name, value)
    SELECT * FROM ${sql.unnest(
      [
        [incomeIdRows.rows[0].id, 'Tax', -59622],
        [incomeIdRows.rows[0].id, 'NI', -41302],
        [incomeIdRows.rows[1].id, 'Tax', -49020],
      ],
      ['int4', 'text', 'int4'],
    )}
    `);
  };

  describe('mutation syncPlanning', () => {
    const mutation = gql`
      mutation SyncPlanning($year: NonNegativeInt!, $input: PlanningSync) {
        syncPlanning(year: $year, input: $input) {
          error
          year
          parameters {
            rates {
              name
              value
            }
            thresholds {
              name
              value
            }
          }
          accounts {
            id
            account
            netWorthSubcategoryId
            income {
              id
              startDate
              endDate
              salary
              taxCode
              pensionContrib
              studentLoan
            }
            creditCards {
              id
              netWorthSubcategoryId
              payments {
                id
                month
                value
              }
              predictedPayment
            }
            values {
              id
              month
              transferToAccountId
              name
              value
              formula
            }
            upperLimit
            lowerLimit
            computedValues {
              key
              month
              name
              value
              isVerified
              isTransfer
            }
            computedStartValue
            includeBills
          }
          taxReliefFromPreviousYear
        }
      }
    `;

    const variablesCreate = (): MutationSyncPlanningArgs => ({
      year: myYear,
      input: {
        parameters: {
          thresholds: [
            {
              name: 'IncomeTaxBasicThreshold',
              value: 12500,
            },
            {
              name: 'IncomeTaxBasicAllowance',
              value: 3750000,
            },
            {
              name: 'NIPT',
              value: 79700,
            },
            {
              name: 'NIUEL',
              value: 418900,
            },
            {
              name: 'StudentLoanThreshold',
              value: 2750000,
            },
          ],
          rates: [
            {
              name: 'IncomeTaxBasicRate',
              value: 0.2,
            },
            {
              name: 'IncomeTaxHigherRate',
              value: 0.4,
            },
            {
              name: 'NILowerRate',
              value: 0.12,
            },
            {
              name: 'NIHigherRate',
              value: 0.02,
            },
            {
              name: 'StudentLoanRate',
              value: 0.09,
            },
          ],
        },
        accounts: [
          {
            account: 'Something account',
            netWorthSubcategoryId: myOtherBankId,
            income: [],
            creditCards: [],
            values: [],
            upperLimit: 1500000,
            lowerLimit: 500000,
            includeBills: false,
          },
          {
            account: 'My test account',
            netWorthSubcategoryId: myBankId,
            income: [
              {
                startDate: '2020-01-20' as unknown as Date,
                endDate: '2021-01-01' as unknown as Date,
                salary: 6000000,
                taxCode: '1250L',
                studentLoan: true,
                pensionContrib: 0.03,
              },
              {
                startDate: '2025-05-03' as unknown as Date,
                endDate: '2026-01-01' as unknown as Date,
                salary: 8500000,
                taxCode: '1257L',
                studentLoan: true,
                pensionContrib: 0.03,
              },
            ],
            creditCards: [
              {
                netWorthSubcategoryId: myCreditCardId,
                payments: [
                  { month: 6, value: -38625 },
                  { month: 10, value: -22690 },
                ],
              },
            ],
            values: [
              { month: 2, name: 'Some random expense', value: -80000 },
              { month: 9, name: 'Expected income', formula: '75 * 29.3' },
            ],
            upperLimit: 210000,
            lowerLimit: 200000,
          },
        ],
      },
    });

    const setupCreate = async (): Promise<FetchResult<{ syncPlanning: PlanningSyncResponse }>> => {
      await getPool().connect(async (db) => {
        await setupInitialData(db);
      });

      await app.authGqlClient.clearStore();
      const res = await app.authGqlClient.mutate<
        { syncPlanning: PlanningSyncResponse },
        MutationSyncPlanningArgs
      >({
        mutation,
        variables: variablesCreate(),
      });
      return res;
    };

    describe('creating new planning data', () => {
      const setup = setupCreate;

      it('should create threshold rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const thresholdRows = await getPool().query<ThresholdRow>(
          sql`SELECT * FROM planning_thresholds`,
        );

        expect(thresholdRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: myYear,
              name: 'IncomeTaxBasicThreshold',
              value: 12500,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: myYear,
              name: 'IncomeTaxBasicAllowance',
              value: 3750000,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: myYear,
              name: 'NIPT',
              value: 79700,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: myYear,
              name: 'NIUEL',
              value: 418900,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: myYear,
              name: 'StudentLoanThreshold',
              value: 2750000,
            }),
          ]),
        );
        expect(thresholdRows.rows).toHaveLength(5);
      });

      it('should create rate rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const rateRows = await getPool().query<RateRow>(sql`SELECT * FROM planning_rates`);

        expect(rateRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: myYear,
              name: 'IncomeTaxBasicRate',
              value: 0.2,
            }),
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: myYear,
              name: 'IncomeTaxHigherRate',
              value: 0.4,
            }),
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: myYear,
              name: 'NILowerRate',
              value: 0.12,
            }),
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: myYear,
              name: 'NIHigherRate',
              value: 0.02,
            }),
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: myYear,
              name: 'StudentLoanRate',
              value: 0.09,
            }),
          ]),
        );
        expect(rateRows.rows).toHaveLength(5);
      });

      it('should create account rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const accountRows = await getPool().query<AccountRow>(sql`SELECT * FROM planning_accounts`);

        expect(accountRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<AccountRow>>({
              uid: app.uid,
              account: 'My test account',
              net_worth_subcategory_id: myBankId,
              limit_upper: 210000,
              limit_lower: 200000,
              include_bills: null,
            }),
            expect.objectContaining<Partial<AccountRow>>({
              uid: app.uid,
              account: 'Something account',
              net_worth_subcategory_id: myOtherBankId,
              limit_upper: 1500000,
              limit_lower: 500000,
              include_bills: false,
            }),
          ]),
        );
        expect(accountRows.rows).toHaveLength(2);
      });

      it('should create income rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const incomeRows = await getPool().query<PlanningIncomeRow>(sql`
        SELECT planning_income.*
        FROM planning_accounts
        INNER JOIN planning_income ON planning_income.account_id = planning_accounts.id
        WHERE planning_accounts.uid = ${app.uid}
        `);

        expect(incomeRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<PlanningIncomeRow>>({
              start_date: new Date('2020-01-20'),
              end_date: new Date('2021-01-01'),
              salary: 6000000,
              tax_code: '1250L',
              student_loan: true,
              pension_contrib: 0.03,
            }),
            expect.objectContaining<Partial<PlanningIncomeRow>>({
              start_date: new Date('2025-05-03'),
              end_date: new Date('2026-01-01'),
              salary: 8500000,
              tax_code: '1257L',
              student_loan: true,
              pension_contrib: 0.03,
            }),
          ]),
        );
        expect(incomeRows.rows).toHaveLength(2);
      });

      it('should create credit card rows in the database', async () => {
        expect.assertions(1);
        await setup();

        const creditCardRows = await getPool().query<PlanningCreditCardRow>(sql`
        SELECT planning_credit_cards.*
        FROM planning_accounts
        INNER JOIN planning_credit_cards ON planning_credit_cards.account_id = planning_accounts.id
        WHERE planning_accounts.uid = ${app.uid}
        `);

        expect(creditCardRows.rows).toStrictEqual([
          expect.objectContaining<Partial<PlanningCreditCardRow>>({
            net_worth_subcategory_id: myCreditCardId,
          }),
        ]);
      });

      it('should create credit card payment rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const creditCardPaymentRows = await getPool().query<PlanningCreditCardPaymentRow>(sql`
        SELECT planning_credit_card_payments.*
        FROM planning_accounts
        INNER JOIN planning_credit_cards ON planning_credit_cards.account_id = planning_accounts.id
        INNER JOIN planning_credit_card_payments ON
          planning_credit_card_payments.credit_card_id = planning_credit_cards.id
        WHERE planning_accounts.uid = ${app.uid}
        `);

        expect(creditCardPaymentRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<PlanningCreditCardPaymentRow>>({
              year: 2020,
              month: 6,
              value: -38625,
            }),
            expect.objectContaining<Partial<PlanningCreditCardPaymentRow>>({
              year: 2020,
              month: 10,
              value: -22690,
            }),
          ]),
        );
        expect(creditCardPaymentRows.rows).toHaveLength(2);
      });

      it('should create value rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const valueRows = await getPool().query<PlanningValueRow>(sql`
        SELECT planning_values.*
        FROM planning_accounts
        INNER JOIN planning_values ON planning_values.account_id = planning_accounts.id
        WHERE planning_accounts.uid = ${app.uid}
        `);

        expect(valueRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<PlanningValueRow>>({
              year: 2020,
              month: 2,
              name: 'Some random expense',
              value: -80000,
              formula: null,
              transfer_to: null,
            }),
            expect.objectContaining<Partial<PlanningValueRow>>({
              year: 2020,
              month: 9,
              name: 'Expected income',
              value: null,
              formula: '75 * 29.3',
              transfer_to: null,
            }),
          ]),
        );
        expect(valueRows.rows).toHaveLength(2);
      });

      it('should return the parameters and accounts data', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.data?.syncPlanning).toStrictEqual(
          expect.objectContaining<PlanningSyncResponse>({
            error: null,
            year: myYear,
            parameters: expect.objectContaining<Partial<PlanningParameters>>({
              thresholds: expect.arrayContaining([
                expect.objectContaining<TaxThreshold>({
                  name: 'IncomeTaxBasicThreshold',
                  value: 12500,
                }),
                expect.objectContaining<TaxThreshold>({
                  name: 'IncomeTaxBasicAllowance',
                  value: 3750000,
                }),
              ]),
              rates: expect.arrayContaining([
                expect.objectContaining<TaxRate>({
                  name: 'IncomeTaxBasicRate',
                  value: 0.2,
                }),
                expect.objectContaining<TaxRate>({
                  name: 'IncomeTaxHigherRate',
                  value: 0.4,
                }),
              ]),
            }),
            accounts: expect.arrayContaining([
              expect.objectContaining<PlanningAccount>({
                id: expect.any(Number),
                account: 'Something account',
                netWorthSubcategoryId: myOtherBankId,
                income: [],
                creditCards: [],
                values: [],
                computedValues: expect.arrayContaining([]),
                upperLimit: 1500000,
                lowerLimit: 500000,
                includeBills: false,
              }),
              expect.objectContaining<PlanningAccount>({
                id: expect.any(Number),
                account: 'My test account',
                netWorthSubcategoryId: myBankId,
                income: expect.arrayContaining([
                  expect.objectContaining({
                    id: expect.any(Number),
                    startDate: '2020-01-20' as unknown as Date,
                    endDate: '2021-01-01' as unknown as Date,
                    salary: 6000000,
                    taxCode: '1250L',
                    studentLoan: true,
                    pensionContrib: 0.03,
                  }),
                  expect.objectContaining({
                    id: expect.any(Number),
                    startDate: '2025-05-03' as unknown as Date,
                    endDate: '2026-01-01' as unknown as Date,
                    salary: 8500000,
                    taxCode: '1257L',
                    studentLoan: true,
                    pensionContrib: 0.03,
                  }),
                ]),
                creditCards: [
                  expect.objectContaining({
                    id: expect.any(Number),
                    netWorthSubcategoryId: myCreditCardId,
                    payments: expect.arrayContaining(
                      [
                        { id: expect.any(Number), month: 6, value: -38625 },
                        { id: expect.any(Number), month: 10, value: -22690 },
                      ].map(expect.objectContaining),
                    ),
                  }),
                ],
                values: expect.arrayContaining([
                  expect.objectContaining({
                    id: expect.any(Number),
                    month: 2,
                    name: 'Some random expense',
                    value: -80000,
                    formula: null,
                    transferToAccountId: null,
                  }),
                  expect.objectContaining({
                    id: expect.any(Number),
                    month: 9,
                    name: 'Expected income',
                    value: null,
                    formula: '75 * 29.3',
                    transferToAccountId: null,
                  }),
                ]),
                upperLimit: 210000,
                lowerLimit: 200000,
                computedValues: expect.arrayContaining([]),
                includeBills: null,
              }),
            ]),
          }),
        );
      });
    });

    describe('updating existing planning data', () => {
      const variablesUpdate = (
        createRes: PlanningSyncResponse,
      ): MutationSyncPlanningArgsRawDate => {
        const threshold0 = createRes.parameters?.thresholds.find(
          (compare) => compare.name === 'IncomeTaxBasicAllowance',
        ) as TaxThreshold;

        const rate0 = createRes.parameters?.rates.find(
          (compare) => compare.name === 'IncomeTaxBasicRate',
        ) as TaxRate;

        const account1 = createRes.accounts?.find(
          (compare) => compare.account === 'My test account',
        ) as PlanningAccount;

        const ccPayment0 = account1.creditCards[0].payments.find(
          (compare) => compare.month === 6,
        ) as PlanningCreditCardPayment;

        const value0 = account1.values.find(
          (compare) => compare.name === 'Some random expense',
        ) as PlanningValue;

        return {
          year: myYear,
          input: {
            parameters: {
              thresholds: [
                omitTypeName(threshold0),
                // Note, basic threshold (2020) should be removed
                {
                  name: 'OtherThreshold',
                  value: 15000000,
                },
              ],
              rates: [
                {
                  ...omitTypeName(rate0),
                  value: 0.07, // I wish!
                },
                // Note, the higher rate should be removed
                {
                  name: 'IncomeTaxAdditionalRate',
                  value: 0.45,
                },
              ],
            },
            accounts: [
              // Note, "Something account" should be removed
              {
                ...omit(account1, '__typename', 'computedValues', 'computedStartValue'),
                account: 'My modified test account',
                upperLimit: 1000000,
                includeBills: true,
                income: [
                  {
                    ...omitTypeName(account1.income[0]),
                    salary: 6600000,
                  },
                ],
                creditCards: [
                  {
                    ...omit(account1.creditCards[0], '__typename', 'predictedPayment'),
                    payments: [
                      {
                        ...omitTypeName(ccPayment0),
                        value: -29273,
                      },
                      // Note, Nov-2020 should be removed
                      { month: 11, value: -77502 },
                    ],
                  },
                ],
                values: [
                  {
                    ...omitTypeName(value0),
                    name: 'Some modified random expense',
                  },
                  // Note, Sep-2020 value should be removed
                  { month: 5, name: 'Some new value', formula: '-2000 / 395' },
                ],
              },
            ],
          },
        };
      };

      const setupUpdate = async (
        createRes: PlanningSyncResponse,
      ): Promise<Maybe<PlanningSyncResponse> | undefined> => {
        await app.authGqlClient.clearStore();
        const res = await app.authGqlClient.mutate<
          { syncPlanning: PlanningSyncResponse },
          MutationSyncPlanningArgsRawDate
        >({
          mutation,
          variables: variablesUpdate(createRes),
        });
        return res.data?.syncPlanning;
      };

      it('should create, delete and update threshold rows as necessary', async () => {
        expect.assertions(2);
        const resCreate = await setupCreate();
        const rowsAfterCreate = await getPool().query<ThresholdRow>(
          sql`SELECT * FROM planning_thresholds ORDER BY name, year`,
        );

        await setupUpdate(resCreate.data?.syncPlanning as PlanningSyncResponse);
        const rowsAfterUpdate = await getPool().query<ThresholdRow>(
          sql`SELECT * FROM planning_thresholds ORDER BY name, year`,
        );

        expect(rowsAfterCreate.rows).toStrictEqual([
          expect.objectContaining({ name: 'IncomeTaxBasicAllowance' }),
          expect.objectContaining({ name: 'IncomeTaxBasicThreshold', year: 2020 }),
          expect.objectContaining({ name: 'NIPT' }),
          expect.objectContaining({ name: 'NIUEL' }),
          expect.objectContaining({ name: 'StudentLoanThreshold' }),
        ]);

        expect(rowsAfterUpdate.rows).toStrictEqual<ThresholdRow[]>([
          {
            ...rowsAfterCreate.rows[0],
          },
          {
            id: expect.any(Number),
            name: 'OtherThreshold',
            year: 2020,
            value: 15000000,
            uid: app.uid,
          },
        ]);
      });

      it('should create, delete and update rate rows as necessary', async () => {
        expect.assertions(2);
        const resCreate = await setupCreate();
        const rowsAfterCreate = await getPool().query<RateRow>(
          sql`SELECT * FROM planning_rates ORDER BY name, year`,
        );

        await setupUpdate(resCreate.data?.syncPlanning as PlanningSyncResponse);
        const rowsAfterUpdate = await getPool().query<RateRow>(
          sql`SELECT * FROM planning_rates ORDER BY name, year`,
        );

        expect(rowsAfterCreate.rows).toStrictEqual([
          expect.objectContaining({ name: 'IncomeTaxBasicRate' }),
          expect.objectContaining({ name: 'IncomeTaxHigherRate' }),
          expect.objectContaining({ name: 'NIHigherRate' }),
          expect.objectContaining({ name: 'NILowerRate' }),
          expect.objectContaining({ name: 'StudentLoanRate' }),
        ]);

        expect(rowsAfterUpdate.rows).toStrictEqual<ThresholdRow[]>([
          {
            id: expect.any(Number),
            name: 'IncomeTaxAdditionalRate',
            year: 2020,
            value: 0.45,
            uid: app.uid,
          },
          {
            id: expect.any(Number),
            name: 'IncomeTaxBasicRate',
            year: 2020,
            value: 0.07,
            uid: app.uid,
          },
        ]);
      });

      it('should create, delete and update account rows as necessary', async () => {
        expect.assertions(2);

        const resCreate = await setupCreate();
        const rowsAfterCreate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_accounts ORDER BY account`,
        );

        await setupUpdate(resCreate.data?.syncPlanning as PlanningSyncResponse);
        const rowsAfterUpdate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_accounts ORDER BY account`,
        );

        expect(rowsAfterCreate.rows).toStrictEqual([
          expect.objectContaining<Partial<AccountRow>>({
            account: 'My test account',
            include_bills: null,
          }),
          expect.objectContaining<Partial<AccountRow>>({
            account: 'Something account',
            include_bills: false,
          }),
        ]);

        expect(rowsAfterUpdate.rows).toStrictEqual([
          {
            ...rowsAfterCreate.rows[0],
            account: 'My modified test account',
            limit_upper: 1000000,
            include_bills: true,
          },
        ]);
      });

      it('should create, delete and update income rows as necessary', async () => {
        expect.assertions(2);

        const resCreate = await setupCreate();
        const rowsAfterCreate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_income ORDER BY account_id`,
        );

        await setupUpdate(resCreate.data?.syncPlanning as PlanningSyncResponse);
        const rowsAfterUpdate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_income ORDER BY account_id`,
        );

        expect(rowsAfterCreate.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({ salary: 6000000 }),
            expect.objectContaining({ salary: 8500000 }),
          ]),
        );

        expect(rowsAfterUpdate.rows).toStrictEqual([
          {
            ...rowsAfterCreate.rows[0],
            salary: 6600000,
          },
        ]);
      });

      it('should create, delete and update credit card and payment rows as necessary', async () => {
        expect.assertions(4);

        const resCreate = await setupCreate();
        const creditCardRowsAfterCreate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_credit_cards ORDER BY account_id`,
        );
        const paymentRowsAfterCreate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_credit_card_payments ORDER BY year, month`,
        );

        await setupUpdate(resCreate.data?.syncPlanning as PlanningSyncResponse);
        const creditCardRowsAfterUpdate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_credit_cards ORDER BY account_id`,
        );
        const paymentRowsAfterUpdate = await getPool().query<AccountRow>(
          sql`SELECT * FROM planning_credit_card_payments ORDER BY year, month`,
        );

        expect(creditCardRowsAfterCreate.rows).toStrictEqual([
          expect.objectContaining({ net_worth_subcategory_id: myCreditCardId }),
        ]);
        expect(creditCardRowsAfterUpdate.rows).toStrictEqual(creditCardRowsAfterCreate.rows);

        expect(paymentRowsAfterCreate.rows).toStrictEqual([
          expect.objectContaining({ year: 2020, month: 6, value: -38625 }),
          expect.objectContaining({ year: 2020, month: 10, value: -22690 }),
        ]);

        expect(paymentRowsAfterUpdate.rows).toStrictEqual([
          { ...paymentRowsAfterCreate.rows[0], value: -29273 },
          expect.objectContaining({ year: 2020, month: 11, value: -77502 }),
        ]);
      });
    });

    describe('adding new data for a different year', () => {
      const otherYear = myYear + 3;

      const variablesNewYear = (
        createRes: PlanningSyncResponse,
      ): MutationSyncPlanningArgsRawDate => ({
        year: otherYear,
        input: {
          parameters: {
            thresholds: [
              {
                name: 'IncomeTaxBasicAllowance',
                value: 3790000,
              },
            ],
            rates: [
              {
                name: 'IncomeTaxBasicRate',
                value: 0.23,
              },
            ],
          },
          accounts:
            createRes.accounts?.map<PlanningAccountInput>((account) => ({
              ...omit(omitTypeName(account), '__typename', 'computedValues', 'computedStartValue'),
              income: account.income.map(omitTypeName),
              creditCards: account.creditCards.map((card) => ({
                ...omit(card, '__typename', 'predictedPayment'),
                payments: [],
              })),
              values:
                account.account === 'My test account'
                  ? [{ month: 4, name: 'Some new year expense', value: -55000 }]
                  : [],
            })) ?? [],
        },
      });

      const setupNewYear = async (
        createRes: PlanningSyncResponse,
      ): Promise<Maybe<PlanningSyncResponse> | undefined> => {
        await app.authGqlClient.clearStore();
        const res = await app.authGqlClient.mutate<
          { syncPlanning: PlanningSyncResponse },
          MutationSyncPlanningArgsRawDate
        >({
          mutation,
          variables: variablesNewYear(createRes),
        });
        return res.data?.syncPlanning;
      };

      it('should add new threshold rows while keeping the existing ones', async () => {
        expect.assertions(2);
        const createRes = await setupCreate();
        await setupNewYear(createRes.data?.syncPlanning as PlanningSyncResponse);

        const { rows } = await getPool().query<ThresholdRow>(
          sql`SELECT * FROM planning_thresholds ORDER BY name, year`,
        );

        expect(rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<ThresholdRow>>({
              year: myYear,
              name: 'IncomeTaxBasicAllowance',
              value: 3750000,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              year: myYear,
              name: 'IncomeTaxBasicThreshold',
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              name: 'NIPT',
              value: 79700,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              name: 'NIUEL',
              value: 418900,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              name: 'StudentLoanThreshold',
              value: 2750000,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              year: otherYear,
              name: 'IncomeTaxBasicAllowance',
              value: 3790000,
            }),
          ]),
        );
        expect(rows).toHaveLength(6);
      });

      it('should add new rate rows while keeping the existing ones', async () => {
        expect.assertions(2);
        const createRes = await setupCreate();
        await setupNewYear(createRes.data?.syncPlanning as PlanningSyncResponse);

        const { rows } = await getPool().query<ThresholdRow>(
          sql`SELECT * FROM planning_rates ORDER BY name, year`,
        );

        expect(rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<ThresholdRow>>({
              year: myYear,
              name: 'IncomeTaxBasicRate',
              value: 0.2,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              year: myYear,
              name: 'IncomeTaxHigherRate',
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              name: 'NILowerRate',
              value: 0.12,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              name: 'NIHigherRate',
              value: 0.02,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              name: 'StudentLoanRate',
              value: 0.09,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              year: otherYear,
              name: 'IncomeTaxBasicRate',
              value: 0.23,
            }),
          ]),
        );
        expect(rows).toHaveLength(6);
      });

      it('should add new value rows while keeping the existing ones', async () => {
        expect.assertions(2);
        const createRes = await setupCreate();
        await setupNewYear(createRes.data?.syncPlanning as PlanningSyncResponse);

        const valueRows = await getPool().query<PlanningValueRow>(sql`
        SELECT planning_values.*
        FROM planning_accounts
        INNER JOIN planning_values ON planning_values.account_id = planning_accounts.id
        WHERE planning_accounts.uid = ${app.uid}
        `);

        expect(valueRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<PlanningValueRow>>({
              year: myYear,
              name: 'Some random expense',
            }),
            expect.objectContaining<Partial<PlanningValueRow>>({
              year: myYear,
              name: 'Expected income',
            }),
            expect.objectContaining<Partial<PlanningValueRow>>({
              year: otherYear,
              name: 'Some new year expense',
              value: -55000,
            }),
          ]),
        );
        expect(valueRows.rows).toHaveLength(3);
      });
    });

    describe('when called without an input', () => {
      let clock: sinon.SinonFakeTimers | undefined;
      afterEach(() => {
        clock?.restore();
      });

      const setupRead = async (year = myYear): Promise<PlanningSyncResponse | undefined> => {
        app.authGqlClient.clearStore();
        clock = sinon.useFakeTimers(new Date('2020-05-11T15:30:20+0100'));
        const res = await app.authGqlClient.mutate<
          { syncPlanning: PlanningSyncResponse },
          MutationSyncPlanningArgs
        >({
          mutation,
          variables: { year, input: null },
        });
        return res.data?.syncPlanning;
      };

      it('should return the current planning state for the given year', async () => {
        expect.assertions(1);
        await setupCreate();
        const res = await setupRead();

        expect(res).toStrictEqual<PlanningSyncResponse>({
          __typename: 'PlanningSyncResponse',
          error: null,
          year: myYear,
          accounts: expect.arrayContaining([
            expect.objectContaining({
              account: 'Something account',
              upperLimit: expect.any(Number),
              lowerLimit: expect.any(Number),
            }),
          ]),
          parameters: {
            __typename: 'PlanningParameters',
            rates: expect.arrayContaining([
              expect.objectContaining({ name: 'IncomeTaxBasicRate', value: 0.2 }),
              expect.objectContaining({ name: 'IncomeTaxHigherRate', value: 0.4 }),
            ]),
            thresholds: expect.arrayContaining([
              expect.objectContaining({ name: 'IncomeTaxBasicAllowance', value: 3750000 }),
            ]),
          },
          taxReliefFromPreviousYear: expect.any(Number),
        });
      });

      it('should only include those parameters relevant to the given year', async () => {
        expect.assertions(2);
        await setupCreate();
        await getPool().query(sql`
        INSERT INTO planning_rates (uid, year, name, value)
        VALUES (${app.uid}, ${myYear - 1}, ${'My old rate name'}, ${123})
        `);
        const res = await setupRead();

        expect(res?.parameters?.rates).toHaveLength(5);
        expect(res?.parameters?.thresholds).toHaveLength(5);
      });

      it('should include all income data associated with the account', async () => {
        expect.assertions(3);
        await setupCreate();
        const res = await setupRead();

        const accountWithoutSalary = res?.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        const accountWithSalary = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        expect(accountWithoutSalary?.income).toHaveLength(0);

        expect(accountWithSalary?.income).toStrictEqual(
          expect.arrayContaining<PlanningIncome>([
            expect.objectContaining<PlanningIncome>({
              id: expect.any(Number),
              startDate: '2025-05-03',
              endDate: '2026-01-01',
              salary: 8500000,
              taxCode: '1257L',
              studentLoan: true,
              pensionContrib: 0.03,
            }),
            expect.objectContaining<PlanningIncome>({
              id: expect.any(Number),
              startDate: '2020-01-20',
              endDate: '2021-01-01',
              salary: 6000000,
              taxCode: '1250L',
              studentLoan: true,
              pensionContrib: 0.03,
            }),
          ]),
        );
        expect(accountWithSalary?.income).toHaveLength(2);
      });

      it('should include credit card data associated with the account', async () => {
        expect.assertions(2);
        await setupCreate();
        const res = await setupRead();

        const accountWithoutCC = res?.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        const accountWithCC = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        expect(accountWithoutCC?.creditCards).toHaveLength(0);

        expect(accountWithCC?.creditCards).toStrictEqual<PlanningCreditCard[]>([
          expect.objectContaining<PlanningCreditCard>({
            id: expect.any(Number),
            netWorthSubcategoryId: myCreditCardId,
            payments: expect.arrayContaining([
              expect.objectContaining<PlanningCreditCardPayment>({
                id: expect.any(Number),
                month: 6,
                value: -38625,
              }),
              expect.objectContaining<PlanningCreditCardPayment>({
                id: expect.any(Number),
                month: 10,
                value: -22690,
              }),
            ]),
            predictedPayment: expect.any(Number),
          }),
        ]);
      });

      it('should include value data associated with the account at the given year', async () => {
        expect.assertions(3);
        const resCreate = await setupCreate();
        const createdAccount = resCreate.data?.syncPlanning?.accounts?.find(
          (compare) => compare.account === 'My test account',
        ) as PlanningAccount;
        await getPool().query(sql`
        INSERT INTO planning_values (year, month, account_id, name, value)
        VALUES (${myYear - 1}, ${3}, ${createdAccount.id}, ${'Some old value'}, ${-1560})
        `);
        const res = await setupRead();

        const accountWithoutValues = res?.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        const accountWithValues = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        expect(accountWithoutValues?.values).toHaveLength(0);

        expect(accountWithValues?.values).toHaveLength(2);
        expect(accountWithValues?.values).toStrictEqual(
          expect.arrayContaining<PlanningValue>([
            expect.objectContaining<PlanningValue>({
              id: expect.any(Number),
              month: 2,
              name: 'Some random expense',
              value: -80000,
              formula: null,
              transferToAccountId: null,
            }),
            expect.objectContaining<PlanningValue>({
              id: expect.any(Number),
              month: 9,
              name: 'Expected income',
              value: null,
              formula: '75 * 29.3',
              transferToAccountId: null,
            }),
          ]),
        );
      });

      it('should compute previous income values with deductions', async () => {
        expect.assertions(1);
        await setupCreate();
        const res = await setupRead();

        const accountWithIncome = res?.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        expect(accountWithIncome?.computedValues).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<PlanningComputedValue>({
              key: `salary-2020-04-30`,
              month: 3,
              name: 'Salary',
              value: 500000,
              isVerified: true, // since it's in the past
              isTransfer: false,
            }),
            expect.objectContaining<PlanningComputedValue>({
              key: `deduction-2020-3-Tax`,
              month: 3,
              name: 'Tax',
              value: -59622,
              isVerified: true,
              isTransfer: false,
            }),
            expect.objectContaining<PlanningComputedValue>({
              key: `deduction-2020-3-NI`,
              month: 3,
              name: 'NI',
              value: -41302,
              isVerified: true,
              isTransfer: false,
            }),
          ]),
        );
      });

      it('should compute predicted income transactions, for future months', async () => {
        expect.assertions(2);
        await setupCreate();
        await getPool().query(sql`
        INSERT INTO list_standard (uid, page, date, item, category, value, shop)
        VALUES (${app.uid}, ${
          PageListStandard.Income
        }, ${'2020-05-14'}, ${'Salary (My test account)'}, ${'Work'}, ${550000}, ${'My company'})
        `);
        const res = await setupRead();

        const accountWithSalary = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        expect(accountWithSalary?.computedValues).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<PlanningComputedValue>({
              key: 'salary-2020-5-predicted',
              month: 5, // June
              name: 'Salary',
              value: 500000,
              isVerified: false,
              isTransfer: false,
            }),
            expect.objectContaining<PlanningComputedValue>({
              key: 'deduction-2020-5-Pension-predicted',
              month: 5,
              name: 'Pension (SalSac)',
              value: -15000,
              isVerified: false,
              isTransfer: false,
            }),
            expect.objectContaining<PlanningComputedValue>({
              key: 'deduction-2020-5-Tax-predicted',
              month: 5,
              name: 'Income tax',
              value: -62500,
              isVerified: false,
              isTransfer: false,
            }),
            expect.objectContaining<PlanningComputedValue>({
              key: 'deduction-2020-5-NI-predicted',
              month: 5,
              name: 'NI',
              value: -42026,
              isVerified: false,
              isTransfer: false,
            }),
            expect.objectContaining<PlanningComputedValue>({
              key: 'deduction-2020-5-Student loan-predicted',
              month: 5,
              name: 'Student loan',
              value: -23025,
              isVerified: false,
              isTransfer: false,
            }),
          ]),
        );

        expect(accountWithSalary?.computedValues).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              key: 'salary-2020-4-predicted',
              month: 4,
              name: 'Salary',
            }),
          ]),
        );
      });

      describe('when there is no income recorded for the current month', () => {
        const setupWithoutPresentIncome = async (): ReturnType<typeof setupRead> => {
          await setupCreate();
          await getPool().query(sql`
          DELETE FROM list_standard WHERE page = ${
            PageListStandard.Income
          } AND date = ${'2020-05-14'}
          `);
          const res = await setupRead();
          return res;
        };

        it('should compute predicted income for the present month', async () => {
          expect.assertions(1);
          const res = await setupWithoutPresentIncome();

          const accountWithSalary = res?.accounts?.find(
            (compare) => compare.account === 'My test account',
          );
          expect(accountWithSalary?.computedValues).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining<PlanningComputedValue>({
                key: 'salary-2020-4-predicted',
                month: 4, // May
                name: 'Salary',
                value: 500000,
                isVerified: false,
                isTransfer: false,
              }),
              expect.objectContaining<PlanningComputedValue>({
                key: 'deduction-2020-4-Pension-predicted',
                month: 4,
                name: 'Pension (SalSac)',
                value: -15000,
                isVerified: false,
                isTransfer: false,
              }),
              expect.objectContaining<PlanningComputedValue>({
                key: 'deduction-2020-4-Tax-predicted',
                month: 4,
                name: 'Income tax',
                value: -62500,
                isVerified: false,
                isTransfer: false,
              }),
              expect.objectContaining<PlanningComputedValue>({
                key: 'deduction-2020-4-NI-predicted',
                month: 4,
                name: 'NI',
                value: -42026,
                isVerified: false,
                isTransfer: false,
              }),
              expect.objectContaining<PlanningComputedValue>({
                key: 'deduction-2020-4-Student loan-predicted',
                month: 4,
                name: 'Student loan',
                value: -23025,
                isVerified: false,
                isTransfer: false,
              }),
            ]),
          );
        });
      });

      it('should compute transfer transactions', async () => {
        expect.assertions(1);
        const resCreate = await setupCreate();

        const accountWithSalary = resCreate.data?.syncPlanning.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        const accountToTransferTo = resCreate.data?.syncPlanning.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        await getPool().connect(async (db) => {
          await db.query(sql`
          INSERT INTO planning_values (year, month, account_id, name, value, formula, transfer_to)
          SELECT * FROM ${sql.unnest(
            [
              [
                myYear,
                6,
                accountWithSalary?.id,
                'Transfer to other account',
                -16000,
                null,
                accountToTransferTo?.id,
              ],
            ],
            ['int4', 'int4', 'int4', 'text', 'int4', 'text', 'int4'],
          )}
          `);
        });

        const res = await setupRead();

        const accountToTransferToRead = res?.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        expect(accountToTransferToRead?.computedValues).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'My test account transfer',
              value: 16000,
              isTransfer: true,
            }),
          ]),
        );
      });

      it('should not return income transactions where the value is zero', async () => {
        expect.assertions(4);
        await setupCreate();
        await getPool().connect(async (db) => {
          await db.query(sql`
          UPDATE planning_income SET student_loan = ${false}
          `);

          await db.query(sql`
          UPDATE planning_rates SET value = 0 WHERE name = ANY(${sql.array(
            ['NILowerRate', 'NIHigherRate'],
            'text',
          )})
          `);
        });

        const res = await setupRead();

        const accountWithSalary = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        expect(accountWithSalary?.computedValues).not.toHaveLength(0);

        expect(accountWithSalary?.computedValues).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Salary',
            }),
          ]),
        );

        expect(accountWithSalary?.computedValues).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Student loan',
            }),
          ]),
        );
        expect(accountWithSalary?.computedValues).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'NI',
            }),
          ]),
        );
      });

      it('should compute the predicted credit card payment, for future months', async () => {
        expect.assertions(1);
        await setupCreate();
        const res = await setupRead();

        const accountWithCreditCard = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );

        // median of *all* existing payments (this is necessary so that it's consistent across
        // requests for multiple years)
        expect(accountWithCreditCard?.creditCards[0].predictedPayment).toBe(
          -Math.round((38625 + 22690) / 2),
        );
      });

      it('should compute the value of the account at the beginning of the financial year', async () => {
        expect.assertions(2);
        await setupCreate();
        const res = await setupRead();

        const accountWithMyBank = res?.accounts?.find(
          (compare) => compare.account === 'My test account',
        );
        const accountWithMyOtherBank = res?.accounts?.find(
          (compare) => compare.account === 'Something account',
        );

        const expectedPredictedIncomeMyBank = (500000 - 15000) * 2; // Feb, Mar 2020
        const expectedCreditCardPaymentsContribution = Math.round((38625 + 22690) / 2) * 2;

        const expectedMyBankValueMar2020 =
          myBankValueJan2020 +
          expectedPredictedIncomeMyBank -
          expectedCreditCardPaymentsContribution;

        const expectedOtherBankValueMar2020 = myOtherBankValueJan2020;

        expect(accountWithMyBank?.computedStartValue).toBe(expectedMyBankValueMar2020);
        expect(accountWithMyOtherBank?.computedStartValue).toBe(expectedOtherBankValueMar2020);
      });

      describe('for a year in the future', () => {
        it('should compute the tax relief from pension contributions in the previous year', async () => {
          expect.assertions(1);
          const resCreate = await setupCreate();
          const accountWithIncome = resCreate.data?.syncPlanning.accounts?.find(
            (compare) => compare.account === 'Something account',
          ) as PlanningAccount;
          await getPool().connect(async (db) => {
            await db.query(sql`
          INSERT INTO planning_values (account_id, year, month, name, value) VALUES
          (${accountWithIncome.id}, ${myYear}, ${5}, ${'Pension (SIPP)'}, ${-20000})
          ,(${accountWithIncome.id}, ${myYear}, ${7}, ${'Pension (SIPP)'}, ${-15000})
          `);
            await db.query(sql`
          INSERT INTO planning_thresholds (uid, year, name, value) VALUES
          (${app.uid}, ${myYear}, ${'IncomeTaxAdditionalThreshold'}, ${15000000})
          `);
            await db.query(sql`
          INSERT INTO planning_rates (uid, year, name, value) VALUES
          (${app.uid}, ${myYear}, ${'IncomeTaxAdditionalRate'}, ${0.45})
          `);
          });

          const expectedTaxRelief = 0.4 * (20000 + 15000);

          const res = await setupRead(myYear + 1);
          expect(res?.taxReliefFromPreviousYear).toBeCloseTo(expectedTaxRelief);
        });

        it('should return the parameters for the given year', async () => {
          expect.assertions(1);
          await setupCreate();

          await getPool().query(sql`
          INSERT INTO planning_rates (uid, year, name, value)
          VALUES (${app.uid}, ${myYear + 1}, ${'MyRate'}, ${0.25})
          `);

          const res = await setupRead(myYear + 1);

          expect(res?.parameters?.rates).toStrictEqual(
            expect.arrayContaining([expect.objectContaining({ name: 'MyRate', value: 0.25 })]),
          );
        });

        it('should include credit cards', async () => {
          expect.assertions(1);
          await setupCreate();

          const res = await setupRead(myYear + 1);

          expect(
            res?.accounts?.find((compare) => compare.account === 'My test account')?.creditCards,
          ).toHaveLength(1);
        });
      });

      describe('when the current month already has a net worth entry defined', () => {
        const setupPreciousNetWorth = async (): Promise<PlanningSyncResponse | undefined> => {
          await setupCreate();
          app.authGqlClient.clearStore();
          await getPool().query(
            sql`UPDATE net_worth SET date = ${'2020-05-20'} WHERE uid = ${app.uid}`,
          );
          clock = sinon.useFakeTimers(new Date('2020-05-23T20:39:10+0100'));
          const res = await app.authGqlClient.mutate<
            { syncPlanning: PlanningSyncResponse },
            MutationSyncPlanningArgs
          >({
            mutation,
            variables: { year: 2021, input: null },
          });
          return res.data?.syncPlanning;
        };

        it('should assume the net worth value relates to the end of the month when computing boundary', async () => {
          expect.hasAssertions();
          const res = await setupPreciousNetWorth();

          const accountWithIncome = res?.accounts?.find(
            (compare) => compare.account === 'My test account',
          );

          const myBankValueMay2020 = myBankValueJan2020;
          const expectedPreviousIncomeContribution = 0;
          // net income Jun 20-Jan 21 inclusive
          const expectedPredictedIncomeContribution = (500000 - 15000 - 62500 - 42026 - 23025) * 8;
          const expectedExplicitValuesContribution =
            75 * 29.3 * 100 - // Sep-20 explicit value
            80000; // Mar-21 explicit value
          const averageCreditCardPayment = Math.round((38625 + 22690) / 2);
          const expectedCreditCardPaymentsContribution = -(
            (
              averageCreditCardPayment + // Jun-20
              38625 + // Jul-20
              averageCreditCardPayment + // Aug-20
              averageCreditCardPayment + // Sep-20
              averageCreditCardPayment + // Oct-20
              averageCreditCardPayment + // Nov-20
              averageCreditCardPayment + // Dec-20
              averageCreditCardPayment + // Jan-21
              averageCreditCardPayment + // Feb-21
              22690
            ) // Mar-21
          );

          const expectedComputedStartValue =
            myBankValueMay2020 +
            expectedPreviousIncomeContribution +
            expectedPredictedIncomeContribution +
            expectedExplicitValuesContribution +
            expectedCreditCardPaymentsContribution;

          expect(accountWithIncome?.computedStartValue).toBe(expectedComputedStartValue);
        });
      });

      describe('when includeBills is true', () => {
        const setupIncludeBills = async (): Promise<PlanningSyncResponse | undefined> => {
          const resCreate = await setupCreate();
          const myAccount = resCreate.data?.syncPlanning?.accounts?.find(
            (compare) => compare.account === 'Something account',
          ) as PlanningAccount;
          await getPool().connect(async (db) => {
            await db.query(sql`
            UPDATE planning_accounts SET include_bills = ${true} WHERE id = ${myAccount.id}
            `);
            await db.query(sql`
            INSERT INTO list_standard (uid, page, date, item, category, value, shop)
            SELECT * FROM ${sql.unnest(
              [
                [
                  app.uid,
                  PageListStandard.Bills,
                  '2020-04-18',
                  'Gas',
                  'Utilities',
                  9114,
                  'Energy company',
                ],
                [
                  app.uid,
                  PageListStandard.Bills,
                  '2020-05-13',
                  'Mortgage',
                  'Housing',
                  132023,
                  'Bank',
                ],
                [
                  app.uid,
                  PageListStandard.Bills,
                  '2020-05-29',
                  'Electricity',
                  'Utilities',
                  6238,
                  'Energy company',
                ],
              ],
              ['int4', 'page_category', 'date', 'text', 'text', 'int4', 'text'],
            )}
            `);
          });
          const res = await setupRead();
          return res;
        };

        it('should aggregate and add bills as computed transactions', async () => {
          expect.assertions(1);
          const res = await setupIncludeBills();
          const myAccount = res?.accounts?.find(
            (compare) => compare.account === 'Something account',
          ) as PlanningAccount;

          expect(myAccount.computedValues).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining<Partial<PlanningComputedValue>>({
                key: 'bills-2020-3',
                month: 3,
                name: 'Bills',
                value: -9114,
                isVerified: true,
                isTransfer: false,
              }),
              expect.objectContaining<Partial<PlanningComputedValue>>({
                key: 'bills-2020-4',
                month: 4,
                name: 'Bills',
                value: -(132023 + 6238),
                isVerified: false,
                isTransfer: false,
              }),
            ]),
          );
        });
      });
    });
  });
});
