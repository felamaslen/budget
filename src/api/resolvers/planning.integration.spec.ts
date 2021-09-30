import { FetchResult } from 'apollo-boost';
import gql from 'graphql-tag';
import { omit } from 'lodash';
import moize from 'moize';
import { sql } from 'slonik';

import { getPool, withSlonik } from '~api/modules/db';
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
import {
  Maybe,
  MutationSyncPlanningArgs,
  PageListStandard,
  PlanningAccountInput,
  PlanningCreditCardInput,
  PlanningCreditCardPaymentInput,
  PlanningIncomeInput,
  PlanningParametersInput,
  PlanningPastIncome,
  PlanningSyncResponse,
  PlanningTaxRateInput,
  PlanningTaxThresholdInput,
  PlanningValueInput,
} from '~api/types';
import { omitTypeName } from '~shared/utils';

describe('Planning resolver', () => {
  const cleanup = withSlonik(async (db) => {
    await db.query(sql`DELETE FROM planning_accounts`);
    await db.query(sql`DELETE FROM planning_rates`);
    await db.query(sql`DELETE FROM planning_thresholds`);
  });

  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
    await cleanup();
  });

  const myNetWorthCategory = 'My net worth category';
  const myBank = 'My net worth bank subcategory';
  const myOtherBank = 'My other bank subcategory';
  const myCreditCard = 'My net worth credit card subcategory';
  let myBankId: number;
  let myOtherBankId: number;
  let myCreditCardId: number;

  const setupInitialData = withSlonik(async (db) => {
    await db.query(sql`DELETE FROM net_worth_categories WHERE category = ${myNetWorthCategory}`);
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
  });

  describe('Mutation syncPlanning', () => {
    beforeAll(setupInitialData);

    const mutation = gql`
      mutation SyncPlanning($input: PlanningSync!) {
        syncPlanning(input: $input) {
          error
          parameters {
            year
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
            pastIncome {
              date
              gross
              deductions {
                name
                value
              }
            }
            creditCards {
              id
              netWorthSubcategoryId
              payments {
                id
                year
                month
                value
              }
            }
            values {
              id
              year
              month
              transferToAccountId
              name
              value
              formula
            }
          }
        }
      }
    `;

    const variablesCreate = (): MutationSyncPlanningArgs => ({
      input: {
        parameters: [
          {
            year: 2020,
            thresholds: [
              {
                name: 'IncomeTaxBasicThreshold',
                value: 12500,
              },
              {
                name: 'IncomeTaxBasicAllowance',
                value: 37500,
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
            ],
          },
          {
            year: 2021,
            thresholds: [
              {
                name: 'IncomeTaxBasicThreshold',
                value: 12570,
              },
            ],
            rates: [],
          },
        ],
        accounts: [
          {
            account: 'Something account',
            netWorthSubcategoryId: myOtherBankId,
            income: [],
            creditCards: [],
            values: [],
          },
          {
            account: 'My test account',
            netWorthSubcategoryId: myBankId,
            income: [
              {
                startDate: ('2020-01-20' as unknown) as Date,
                endDate: ('2021-01-01' as unknown) as Date,
                salary: 6000000,
                taxCode: '1250L',
                studentLoan: true,
                pensionContrib: 0.03,
              },
            ],
            creditCards: [
              {
                netWorthSubcategoryId: myCreditCardId,
                payments: [
                  { year: 2020, month: 6, value: -38625 },
                  { year: 2020, month: 11, value: -22690 },
                ],
              },
            ],
            values: [
              { year: 2020, month: 2, name: 'Some random expense', value: -80000 },
              { year: 2020, month: 9, name: 'Expected income', formula: '75 * 29.3' },
            ],
          },
        ],
      },
    });

    const setupCreate = async (): Promise<FetchResult<{ syncPlanning: PlanningSyncResponse }>> => {
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
      afterAll(cleanup);

      const setup = moize.promise(setupCreate);

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
              year: 2020,
              name: 'IncomeTaxBasicThreshold',
              value: 12500,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: 2020,
              name: 'IncomeTaxBasicAllowance',
              value: 37500,
            }),
            expect.objectContaining<Partial<ThresholdRow>>({
              uid: app.uid,
              year: 2021,
              name: 'IncomeTaxBasicThreshold',
              value: 12570,
            }),
          ]),
        );
        expect(thresholdRows.rows).toHaveLength(3);
      });

      it('should create rate rows in the database', async () => {
        expect.assertions(2);
        await setup();

        const rateRows = await getPool().query<RateRow>(sql`SELECT * FROM planning_rates`);

        expect(rateRows.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: 2020,
              name: 'IncomeTaxBasicRate',
              value: 0.2,
            }),
            expect.objectContaining<Partial<RateRow>>({
              uid: app.uid,
              year: 2020,
              name: 'IncomeTaxHigherRate',
              value: 0.4,
            }),
          ]),
        );
        expect(rateRows.rows).toHaveLength(2);
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
            }),
            expect.objectContaining<Partial<AccountRow>>({
              uid: app.uid,
              account: 'Something account',
              net_worth_subcategory_id: myOtherBankId,
            }),
          ]),
        );
        expect(accountRows.rows).toHaveLength(2);
      });

      it('should create income rows in the database', async () => {
        expect.assertions(1);
        await setup();

        const incomeRows = await getPool().query<PlanningIncomeRow>(sql`
        SELECT planning_income.*
        FROM planning_accounts
        INNER JOIN planning_income ON planning_income.account_id = planning_accounts.id
        WHERE planning_accounts.uid = ${app.uid}
        `);

        expect(incomeRows.rows).toStrictEqual([
          expect.objectContaining<Partial<PlanningIncomeRow>>({
            start_date: new Date('2020-01-20'),
            end_date: new Date('2021-01-01'),
            salary: 6000000,
            tax_code: '1250L',
            student_loan: true,
            pension_contrib: 0.03,
          }),
        ]);
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
              month: 11,
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
            parameters: expect.arrayContaining([
              expect.objectContaining({
                year: 2020,
                thresholds: expect.arrayContaining(
                  [
                    {
                      name: 'IncomeTaxBasicThreshold',
                      value: 12500,
                    },
                    {
                      name: 'IncomeTaxBasicAllowance',
                      value: 37500,
                    },
                  ].map(expect.objectContaining),
                ),
                rates: expect.arrayContaining(
                  [
                    {
                      name: 'IncomeTaxBasicRate',
                      value: 0.2,
                    },
                    {
                      name: 'IncomeTaxHigherRate',
                      value: 0.4,
                    },
                  ].map(expect.objectContaining),
                ),
              }),
              expect.objectContaining({
                year: 2021,
                thresholds: [
                  {
                    name: 'IncomeTaxBasicThreshold',
                    value: 12570,
                  },
                ].map(expect.objectContaining),
                rates: [],
              }),
            ]),
            accounts: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                account: 'Something account',
                netWorthSubcategoryId: myOtherBankId,
                income: [],
                creditCards: [],
                values: [],
              }),
              expect.objectContaining({
                id: expect.any(Number),
                account: 'My test account',
                netWorthSubcategoryId: myBankId,
                income: [
                  expect.objectContaining({
                    id: expect.any(Number),
                    startDate: ('2020-01-20' as unknown) as Date,
                    endDate: ('2021-01-01' as unknown) as Date,
                    salary: 6000000,
                    taxCode: '1250L',
                    studentLoan: true,
                    pensionContrib: 0.03,
                  }),
                ],
                creditCards: [
                  expect.objectContaining({
                    id: expect.any(Number),
                    netWorthSubcategoryId: myCreditCardId,
                    payments: expect.arrayContaining(
                      [
                        { id: expect.any(Number), year: 2020, month: 6, value: -38625 },
                        { id: expect.any(Number), year: 2020, month: 11, value: -22690 },
                      ].map(expect.objectContaining),
                    ),
                  }),
                ],
                values: expect.arrayContaining([
                  expect.objectContaining({
                    id: expect.any(Number),
                    year: 2020,
                    month: 2,
                    name: 'Some random expense',
                    value: -80000,
                  }),
                  expect.objectContaining({
                    id: expect.any(Number),
                    year: 2020,
                    month: 9,
                    name: 'Expected income',
                    formula: '75 * 29.3',
                  }),
                ]),
              }),
            ]),
          }),
        );
      });

      it('should return past income data', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.data?.syncPlanning.accounts?.[0].pastIncome).toStrictEqual([
          expect.objectContaining<PlanningPastIncome>({
            date: ('2020-04-20' as unknown) as Date,
            gross: 500000,
            deductions: [
              expect.objectContaining({
                name: 'NI',
                value: -41302,
              }),
              expect.objectContaining({
                name: 'Tax',
                value: -59622,
              }),
            ],
          }),
          expect.objectContaining<PlanningPastIncome>({
            date: ('2020-05-14' as unknown) as Date,
            gross: 510000,
            deductions: [
              expect.objectContaining({
                name: 'Tax',
                value: -49020,
              }),
            ],
          }),
        ]);
      });
    });

    describe('updating existing planning data', () => {
      beforeEach(cleanup);

      const variablesUpdate = (createRes: PlanningSyncResponse): MutationSyncPlanningArgs => ({
        input: {
          parameters: [
            {
              ...omitTypeName(createRes.parameters?.[0] as PlanningParametersInput),
              thresholds: [
                omitTypeName(createRes.parameters?.[0].thresholds[0] as PlanningTaxThresholdInput),
                // Note, basic allowance threshold should be removed
                {
                  name: 'OtherThreshold',
                  value: 15000000,
                },
              ],
              rates: [
                {
                  ...omitTypeName(createRes.parameters?.[0].rates[0] as PlanningTaxRateInput),
                  value: 0.07, // I wish!
                },
                // Note, the higher rate should be removed
                {
                  name: 'IncomeTaxAdditionalRate',
                  value: 0.45,
                },
              ],
            },
            // Note, 2021 parameters should be removed
            {
              year: 2024,
              thresholds: [{ name: '2024ThresholdA', value: 123 }],
              rates: [{ name: '2024RateA', value: 0.17 }],
            },
          ],
          accounts: [
            // Note, "Something account" should be removed
            {
              ...omit(omitTypeName(createRes.accounts?.[1] as PlanningAccountInput), 'pastIncome'),
              account: 'My modified test account',
              income: [
                {
                  ...omitTypeName(createRes.accounts?.[1]?.income[0] as PlanningIncomeInput),
                  salary: 6600000,
                },
              ],
              creditCards: [
                {
                  ...omitTypeName(
                    createRes.accounts?.[1]?.creditCards[0] as PlanningCreditCardInput,
                  ),
                  payments: [
                    {
                      ...omitTypeName(
                        createRes.accounts?.[1]?.creditCards[0]
                          ?.payments[0] as PlanningCreditCardPaymentInput,
                      ),
                      value: -29273,
                    },
                    // Note, Nov-2020 should be removed
                    { year: 2020, month: 12, value: -77502 },
                  ],
                },
              ],
              values: [
                {
                  ...omitTypeName(createRes.accounts?.[1]?.values[0] as PlanningValueInput),
                  name: 'Some modified random expense',
                },
                // Note, Sep-2020 value should be removed
                { year: 2020, month: 5, name: 'Some new value', formula: '-2000 / 395' },
              ],
            },
          ],
        },
      });

      const setupUpdate = async (
        createRes: PlanningSyncResponse,
      ): Promise<Maybe<PlanningSyncResponse> | undefined> => {
        await app.authGqlClient.clearStore();
        const res = await app.authGqlClient.mutate<
          { syncPlanning: PlanningSyncResponse },
          MutationSyncPlanningArgs
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
          expect.objectContaining({ name: 'IncomeTaxBasicThreshold', year: 2021 }),
        ]);

        expect(rowsAfterUpdate.rows).toStrictEqual<ThresholdRow[]>([
          {
            id: expect.any(Number),
            name: '2024ThresholdA',
            year: 2024,
            value: 123,
            uid: app.uid,
          },
          {
            ...rowsAfterCreate.rows[1],
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
        ]);

        expect(rowsAfterUpdate.rows).toStrictEqual<ThresholdRow[]>([
          {
            id: expect.any(Number),
            name: '2024RateA',
            year: 2024,
            value: 0.17,
            uid: app.uid,
          },
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
          expect.objectContaining({ account: 'My test account' }),
          expect.objectContaining({ account: 'Something account' }),
        ]);

        expect(rowsAfterUpdate.rows).toStrictEqual([
          {
            ...rowsAfterCreate.rows[0],
            account: 'My modified test account',
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

        expect(rowsAfterCreate.rows).toStrictEqual([expect.objectContaining({ salary: 6000000 })]);

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
          expect.objectContaining({ year: 2020, month: 11, value: -22690 }),
        ]);

        expect(paymentRowsAfterUpdate.rows).toStrictEqual([
          { ...paymentRowsAfterCreate.rows[0], value: -29273 },
          expect.objectContaining({ year: 2020, month: 12, value: -77502 }),
        ]);
      });
    });
  });
});
