import { formatISO } from 'date-fns';
import { isEqual, omit } from 'lodash';
import type { DatabaseTransactionConnectionType } from 'slonik';

import { getPlanningAccounts, getPlanningParameters } from './retrieve';
import {
  AccountRow,
  deleteOldPlanningAccounts,
  deleteOldPlanningCreditCardPayments,
  deleteOldPlanningCreditCards,
  deleteOldPlanningIncome,
  deleteOldPlanningValues,
  insertPlanningAccounts,
  insertPlanningCreditCardPayments,
  insertPlanningCreditCards,
  insertPlanningIncome,
  insertPlanningValues,
  ParameterRow,
  PlanningCreditCardPaymentRow,
  PlanningCreditCardRow,
  PlanningIncomeRow,
  PlanningValueRow,
  selectPlanningAccounts,
  selectPlanningCreditCardPayments,
  selectPlanningCreditCards,
  selectPlanningIncome,
  selectPlanningValues,
  updatePlanningAccount,
  updatePlanningCreditCard,
  updatePlanningCreditCardPayments,
  updatePlanningIncome,
  updatePlanningValue,
  upsertRates,
  upsertThresholds,
} from '~api/queries/planning';
import {
  MutationSyncPlanningArgs,
  PlanningAccountInput,
  PlanningCreditCardInput,
  PlanningCreditCardPaymentInput,
  PlanningIncomeInput,
  PlanningParametersInput,
  PlanningSyncResponse,
} from '~api/types';
import { Create } from '~shared/types';

const reduceParameters = (
  inputParameters: PlanningParametersInput[],
  key: 'thresholds' | 'rates',
): Omit<ParameterRow, 'id' | 'uid'>[] =>
  inputParameters.reduce<Omit<ParameterRow, 'id' | 'uid'>[]>(
    (last, input) => [
      ...last,
      ...input[key].map<Omit<ParameterRow, 'id' | 'uid'>>(({ name, value }) => ({
        year: input.year,
        name,
        value,
      })),
    ],
    [],
  );

async function syncParameters(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationSyncPlanningArgs,
): Promise<void> {
  const allThresholds = reduceParameters(args.input.parameters, 'thresholds');
  const allRates = reduceParameters(args.input.parameters, 'rates');

  await Promise.all([upsertThresholds(db, uid, allThresholds), upsertRates(db, uid, allRates)]);
}

type WithoutUid<Row extends { readonly id: number }> = Row extends { uid: number }
  ? Omit<Row, 'uid'>
  : Row;

const syncItems = <Row extends { readonly id: number }, Input>({
  insertRows,
  updateRow,
  deleteOldRows,
  selectExistingRows,
  getNewInput,
  getUpdatedInput,
}: {
  insertRows: (
    db: DatabaseTransactionConnectionType,
    uid: number,
    rows: Create<WithoutUid<Row>>[],
  ) => Promise<readonly Row[]>;
  updateRow: (
    db: DatabaseTransactionConnectionType,
    uid: number,
    row: WithoutUid<Row>,
  ) => Promise<void>;
  deleteOldRows: (
    db: DatabaseTransactionConnectionType,
    uid: number,
    existingIds: number[],
  ) => Promise<void>;
  selectExistingRows: (
    db: DatabaseTransactionConnectionType,
    uid: number,
  ) => Promise<readonly Row[]>;
  getNewInput: (input: Input) => Create<WithoutUid<Row>>[];
  getUpdatedInput: (input: Input) => WithoutUid<Row>[];
}) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  input: Input,
): Promise<readonly (Row | WithoutUid<Row>)[]> => {
  const existingRows = await selectExistingRows(db, uid);
  const newInput = getNewInput(input);
  const updatedInput = getUpdatedInput(input);

  const updatedDelta = updatedInput.filter((row) => {
    const existingRow = existingRows.find(({ id }) => id === row.id);
    return !!existingRow && !isEqual(omit(row, 'id'), omit(existingRow, 'id', 'uid'));
  });

  await Promise.all(updatedDelta.map((row) => updateRow(db, uid, row)));

  const insertedRows = await insertRows(db, uid, newInput);

  const existingIds = [...insertedRows, ...updatedInput].map((row) => row.id);

  await deleteOldRows(db, uid, existingIds);

  return [...updatedInput, ...insertedRows];
};

const mapIncomeRow = (accountId: number) => (
  row: PlanningIncomeInput,
): Create<PlanningIncomeRow> => ({
  account_id: accountId,
  start_date: formatISO(row.startDate, { representation: 'date' }),
  end_date: formatISO(row.endDate, { representation: 'date' }),
  salary: row.salary,
  tax_code: row.taxCode,
  pension_contrib: row.pensionContrib,
  student_loan: row.studentLoan,
});

const syncIncome = syncItems<PlanningIncomeRow, PlanningAccountWithId[]>({
  insertRows: insertPlanningIncome,
  updateRow: updatePlanningIncome,
  deleteOldRows: deleteOldPlanningIncome,
  selectExistingRows: selectPlanningIncome,
  getNewInput: (accountInputs) =>
    accountInputs.reduce<Create<PlanningIncomeRow>[]>(
      (last, accountInput) => [
        ...last,
        ...accountInput.income
          .filter((row) => !row.id)
          .map<Create<PlanningIncomeRow>>(mapIncomeRow(accountInput.id)),
      ],
      [],
    ),
  getUpdatedInput: (accountInputs) =>
    accountInputs.reduce<PlanningIncomeRow[]>((last, accountInput) => {
      const incomeRowMapper = mapIncomeRow(accountInput.id);
      return [
        ...last,
        ...accountInput.income
          .filter((row) => !!row.id)
          .map<PlanningIncomeRow>((row) => ({ ...incomeRowMapper(row), id: row.id as number })),
      ];
    }, []),
});

const mapCreditCard = (accountId: number) => (
  row: PlanningCreditCardInput,
): Create<PlanningCreditCardRow> => ({
  account_id: accountId,
  net_worth_subcategory_id: row.netWorthSubcategoryId,
});

const syncCreditCards = syncItems<PlanningCreditCardRow, PlanningAccountWithId[]>({
  insertRows: insertPlanningCreditCards,
  updateRow: updatePlanningCreditCard,
  deleteOldRows: deleteOldPlanningCreditCards,
  selectExistingRows: selectPlanningCreditCards,
  getNewInput: (accountInputs) =>
    accountInputs.reduce<Create<PlanningCreditCardRow>[]>(
      (last, accountInput) => [
        ...last,
        ...accountInput.creditCards
          .filter((row) => !row.id)
          .map<Create<PlanningCreditCardRow>>(mapCreditCard(accountInput.id)),
      ],
      [],
    ),
  getUpdatedInput: (accountInputs) =>
    accountInputs.reduce<PlanningCreditCardRow[]>((last, accountInput) => {
      const creditCardRowMapper = mapCreditCard(accountInput.id);
      return [
        ...last,
        ...accountInput.creditCards
          .filter((row) => !!row.id)
          .map<PlanningCreditCardRow>((row) => ({
            ...creditCardRowMapper(row),
            id: row.id as number,
          })),
      ];
    }, []),
});

const mapCreditCardPayment = (creditCardId: number) => (
  row: PlanningCreditCardPaymentInput,
): Create<PlanningCreditCardPaymentRow> => ({
  credit_card_id: creditCardId,
  year: row.year,
  month: row.month,
  value: row.value,
});

type CreditCardSyncInput = {
  accountInputs: PlanningAccountWithId[];
  creditCardRows: readonly PlanningCreditCardRow[];
};

const getAccountInputsWithNewCreditCardIds = ({
  accountInputs,
  creditCardRows,
}: CreditCardSyncInput): PlanningAccountWithId[] =>
  accountInputs.map<PlanningAccountWithId>((account) => ({
    ...account,
    creditCards: account.creditCards
      .map<PlanningCreditCardInput>((card) => ({
        ...card,
        id:
          card.id ??
          creditCardRows.find(
            (compare) => compare.net_worth_subcategory_id === card.netWorthSubcategoryId,
          )?.id ??
          null,
      }))
      .filter((card) => !!card.id),
  }));

const syncCreditCardPayments = syncItems<PlanningCreditCardPaymentRow, CreditCardSyncInput>({
  insertRows: insertPlanningCreditCardPayments,
  updateRow: updatePlanningCreditCardPayments,
  deleteOldRows: deleteOldPlanningCreditCardPayments,
  selectExistingRows: selectPlanningCreditCardPayments,
  getNewInput: (input) =>
    getAccountInputsWithNewCreditCardIds(input).reduce<Create<PlanningCreditCardPaymentRow>[]>(
      (last, accountInput) =>
        accountInput.creditCards.reduce<Create<PlanningCreditCardPaymentRow>[]>(
          (next, card) => [
            ...next,
            ...card.payments.filter((row) => !row.id).map(mapCreditCardPayment(card.id as number)),
          ],
          last,
        ),
      [],
    ),
  getUpdatedInput: (input) =>
    getAccountInputsWithNewCreditCardIds(input).reduce<PlanningCreditCardPaymentRow[]>(
      (last, accountInput) =>
        accountInput.creditCards
          .filter((row) => !!row.id)
          .reduce<PlanningCreditCardPaymentRow[]>((next, card) => {
            const paymentMapper = mapCreditCardPayment(card.id as number);
            return [
              ...next,
              ...card.payments
                .filter((row) => !!row.id)
                .map<PlanningCreditCardPaymentRow>((row) => ({
                  ...paymentMapper(row),
                  id: row.id as number,
                })),
            ];
          }, last),
      [],
    ),
});

type AccountInputExisting = Create<PlanningAccountInput> & {
  id: NonNullable<PlanningAccountInput['id']>;
};

const isAccountInputExisting = (account: PlanningAccountInput): account is AccountInputExisting =>
  !!account.id;

type PlanningValueRowCreateOrUpdate = Create<PlanningValueRow> &
  Partial<Pick<PlanningValueRow, 'id'>>;

const getAllValueRows = (
  accountInputs: PlanningAccountWithId[],
): PlanningValueRowCreateOrUpdate[] =>
  accountInputs.reduce<PlanningValueRowCreateOrUpdate[]>(
    (last, account) =>
      account.values.reduce<PlanningValueRowCreateOrUpdate[]>(
        (next, row) => [
          ...next,
          {
            id: row.id ?? undefined,
            account_id: account.id,
            year: row.year,
            month: row.month,
            name: row.name,
            value: row.value ?? null,
            formula: row.formula ?? null,
            transfer_to: row.transferToAccountId ?? null,
          },
        ],
        last,
      ),
    [],
  );

const syncValues = syncItems<PlanningValueRow, PlanningAccountWithId[]>({
  insertRows: insertPlanningValues,
  updateRow: updatePlanningValue,
  selectExistingRows: selectPlanningValues,
  deleteOldRows: deleteOldPlanningValues,
  getNewInput: (accountInputs) =>
    getAllValueRows(accountInputs).filter((row): row is Create<PlanningValueRow> => !row.id),
  getUpdatedInput: (accountInputs) =>
    getAllValueRows(accountInputs).filter((row): row is PlanningValueRow => !!row.id),
});

const syncAccountRows = syncItems<AccountRow, MutationSyncPlanningArgs>({
  insertRows: insertPlanningAccounts,
  updateRow: updatePlanningAccount,
  selectExistingRows: selectPlanningAccounts,
  deleteOldRows: deleteOldPlanningAccounts,
  getNewInput: (args) =>
    args.input.accounts
      .filter((account) => !account.id)
      .map<Omit<AccountRow, 'id' | 'uid'>>((account) => ({
        account: account.account,
        net_worth_subcategory_id: account.netWorthSubcategoryId,
      })),
  getUpdatedInput: (args) =>
    args.input.accounts.filter(isAccountInputExisting).map<Omit<AccountRow, 'uid'>>((account) => ({
      id: account.id,
      account: account.account,
      net_worth_subcategory_id: account.netWorthSubcategoryId,
    })),
});

type PlanningAccountWithId = Omit<PlanningAccountInput, 'id'> & {
  id: NonNullable<PlanningAccountInput['id']>;
};

async function syncAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationSyncPlanningArgs,
): Promise<void> {
  const allAccounts = await syncAccountRows(db, uid, args);

  const accountInputs = args.input.accounts
    .map((account) => ({
      ...account,
      id:
        account.id ??
        allAccounts.find(
          (compare) => compare.net_worth_subcategory_id === account.netWorthSubcategoryId,
        )?.id ??
        null,
    }))
    .filter(
      (account): account is PlanningAccountWithId =>
        !!account.id && allAccounts.some((compare) => compare.id === account.id),
    );

  const [, creditCardRows] = await Promise.all([
    syncIncome(db, uid, accountInputs),
    syncCreditCards(db, uid, accountInputs),
    syncValues(db, uid, accountInputs),
  ]);
  await syncCreditCardPayments(db, uid, { accountInputs, creditCardRows });
}

export async function syncPlanning(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationSyncPlanningArgs,
): Promise<PlanningSyncResponse> {
  await syncParameters(db, uid, args);
  await syncAccounts(db, uid, args);

  const [parameters, accounts] = await Promise.all([
    getPlanningParameters(db, uid),
    getPlanningAccounts(db, uid),
  ]);

  return { parameters, accounts };
}
