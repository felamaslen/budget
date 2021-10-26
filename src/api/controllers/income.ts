import { groupBy, isEqual, omit } from 'lodash';
import type { DatabaseTransactionConnectionType } from 'slonik';

import {
  baseController,
  getLimitAndOffset,
  getOlderExists,
  getWeeklyCost,
  processInput,
} from './list';
import { readNetWorthCashTotal } from './net-worth';
import { getDisplayedMonths } from './overview';

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
  selectSinglePageListSummary,
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

async function getIncomeTotals(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<Pick<IncomeReadResponse, 'total' | 'weekly'>> {
  const [totalRows, weeklyCostRows] = await Promise.all([
    selectIncomeTotals(db, uid),
    selectWeeklyNetIncome(db, uid),
  ]);

  const total: IncomeTotals = {
    gross: totalRows[0]?.gross ?? 0,
    deductions: totalRows.map<IncomeDeduction>((row) => ({
      name: row.deduction_name,
      value: -row.deduction_value,
    })),
  };

  const weekly = getWeeklyCost(weeklyCostRows);

  return { total, weekly };
}

type PublishedProperties = {
  overviewCost: number[];
} & Pick<IncomeReadResponse, 'total' | 'weekly'>;

async function getPublishedIncomeProperties(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<PublishedProperties> {
  const [overviewCost, incomeTotals] = await Promise.all([
    selectSinglePageListSummary(db, uid, getDisplayedMonths(new Date()), PageListStandard.Income),
    getIncomeTotals(db, uid),
  ]);

  return { overviewCost, ...incomeTotals };
}

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

  const [publishedProperties, cashTotal] = await Promise.all([
    getPublishedIncomeProperties(db, uid),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<IncomeSubscription>(`${PubSubTopic.IncomeChanged}.${uid}`, {
      created: { fakeId: args.fakeId, item: { id, ...item, deductions } },
      ...publishedProperties,
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

  const [rows, incomeTotals, olderExists] = await Promise.all([
    selectIncome(db, uid, limit, offset),
    getIncomeTotals(db, uid),
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

  return { items, olderExists, ...incomeTotals };
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

  const [publishedProperties, cashTotal] = await Promise.all([
    getPublishedIncomeProperties(db, uid),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<IncomeSubscription>(`${PubSubTopic.IncomeChanged}.${uid}`, {
      updated: { ...result, deductions },
      ...publishedProperties,
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

  const [publishedProperties, cashTotal] = await Promise.all([
    getPublishedIncomeProperties(db, uid),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<IncomeSubscription>(`${PubSubTopic.IncomeChanged}.${uid}`, {
      deleted: args.id,
      ...publishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);

  return { error: null };
}
