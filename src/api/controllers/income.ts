import { groupBy, isEqual, omit } from 'lodash';
import type { DatabaseTransactionConnectionType } from 'slonik';

import {
  baseController,
  getLimitAndOffset,
  getOlderExists,
  getPublishedProperties,
  getWeeklyCost,
  processInput,
} from './list';
import { readNetWorthCashTotal } from './net-worth';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  deleteOldDeductionRows,
  IncomeDeductionRow,
  IncomeRowWithDeduction,
  IncomeRowWithJoins,
  insertIncomeDeductionRows,
  selectIncome,
  selectIncomeDeductionRows,
  selectIncomeTotals,
  selectWeeklyNetIncome,
  updateIncomeDeductionRow,
} from '~api/queries';
import type { IncomeReadResponse, QueryReadIncomeArgs } from '~api/types';
import {
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  Income,
  IncomeDeduction,
  IncomeDeductionInput,
  IncomeSubscription,
  IncomeTotals,
  MutationCreateIncomeArgs,
  MutationDeleteIncomeArgs,
  MutationUpdateIncomeArgs,
  PageListStandard,
} from '~api/types/gql';

async function upsertIncomeDeductions(
  db: DatabaseTransactionConnectionType,
  uid: number,
  listId: number,
  deductions: IncomeDeductionInput[],
): Promise<IncomeDeduction[]> {
  const deductionRowsPrior = await selectIncomeDeductionRows(db, uid, listId);

  const updatedRowsInput = deductions
    .filter((row) => deductionRowsPrior.some((compare) => compare.name === row.name))
    .map<IncomeDeductionRow>((row) => ({
      ...row,
      list_id: listId,
      id: deductionRowsPrior.find((compare) => compare.name === row.name)?.id as number,
    }));

  const updatedRowsFiltered = updatedRowsInput.filter((row) => {
    const existingRow = deductionRowsPrior.find((compare) => compare.id === row.id);
    return !isEqual(row, existingRow);
  });

  await Promise.all(
    updatedRowsFiltered.map((updatedRow) => updateIncomeDeductionRow(db, uid, updatedRow)),
  );

  const newRowsInput = deductions
    .filter((row) => !deductionRowsPrior.some((compare) => compare.name === row.name))
    .map<Omit<IncomeDeductionRow, 'id'>>((row) => ({ ...row, list_id: listId }));

  const newRows = await insertIncomeDeductionRows(db, uid, newRowsInput);

  const allIds = [...newRows, ...updatedRowsInput].map((row) => row.id);
  await deleteOldDeductionRows(db, uid, listId, allIds);

  const deductionRows = await selectIncomeDeductionRows(db, uid, listId);

  return deductionRows.map<IncomeDeduction>((row) => omit(row, 'list_id'));
}

export async function createIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationCreateIncomeArgs,
): Promise<CrudResponseCreate> {
  const { id, ...item } = await baseController.create(
    db,
    uid,
    processInput(PageListStandard.Income, omit(args.input, 'deductions')),
  );

  const deductions = await upsertIncomeDeductions(db, uid, id, args.input.deductions);

  const [listPublishedProperties, cashTotal] = await Promise.all([
    getPublishedProperties(db, uid, PageListStandard.Income),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<IncomeSubscription>(`${PubSubTopic.IncomeChanged}.${uid}`, {
      created: { fakeId: args.fakeId, item: { id, ...item, deductions } },
      ...listPublishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);

  return { id, error: null };
}

const hasDeductionJoin = (row: IncomeRowWithJoins): row is IncomeRowWithDeduction =>
  !!row.deduction_id;

export async function readIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReadIncomeArgs,
): Promise<IncomeReadResponse> {
  const { limit, offset } = getLimitAndOffset(args);

  const [rows, totalRows, weeklyCostRows, olderExists] = await Promise.all([
    selectIncome(db, uid, limit, offset),
    selectIncomeTotals(db, uid),
    selectWeeklyNetIncome(db, uid),
    getOlderExists(db, uid, PageListStandard.Income, limit, offset),
  ]);

  const groupedById = Object.entries(groupBy(rows, 'id'));

  const items = groupedById.map<Income>(([, group]) => ({
    ...omit(group[0], 'deduction_id', 'deduction_name', 'deduction_value'),
    deductions: group.filter(hasDeductionJoin).map<IncomeDeduction>((row) => ({
      id: row.deduction_id,
      name: row.deduction_name,
      value: row.deduction_value,
    })),
  }));

  const total: IncomeTotals = {
    gross: totalRows[0]?.gross ?? 0,
    deductions: totalRows.map<IncomeDeduction>((row) => ({
      name: row.deduction_name,
      value: -row.deduction_value,
    })),
  };

  const weekly = getWeeklyCost(weeklyCostRows);

  return { items, total, weekly, olderExists };
}

export async function updateIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationUpdateIncomeArgs,
): Promise<CrudResponseUpdate> {
  const result = await baseController.update(
    db,
    uid,
    args.id,
    processInput(PageListStandard.Income, omit(args.input, 'deductions')),
  );
  const deductions = await upsertIncomeDeductions(db, uid, args.id, args.input.deductions);

  const [listPublishedProperties, cashTotal] = await Promise.all([
    getPublishedProperties(db, uid, PageListStandard.Income),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<IncomeSubscription>(`${PubSubTopic.IncomeChanged}.${uid}`, {
      updated: { ...result, deductions },
      ...listPublishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);

  return { error: null };
}

export async function deleteIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationDeleteIncomeArgs,
): Promise<CrudResponseDelete> {
  await baseController.delete(db, uid, args.id);

  const [listPublishedProperties, cashTotal] = await Promise.all([
    getPublishedProperties(db, uid, PageListStandard.Income),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<IncomeSubscription>(`${PubSubTopic.IncomeChanged}.${uid}`, {
      deleted: args.id,
      ...listPublishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);

  return { error: null };
}
