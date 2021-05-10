import { badRequest } from '@hapi/boom';
import { endOfMonth, formatISO, isValid, startOfMonth } from 'date-fns';
import { flatten } from 'lodash';
import { DatabaseTransactionConnectionType } from 'slonik';
import {
  insertBucket,
  selectBucketsWithCurrentValue,
  selectInvestmentBucket,
  updateBucket,
  upsertInvestmentBucket,
} from '~api/queries';
import {
  AnalysisPage,
  Bucket,
  InvestmentBucket,
  ListBucketsResponse,
  MutationSetInvestmentBucketArgs,
  MutationUpsertBucketArgs,
  QueryListBucketsArgs,
  SetInvestmentBucketResponse,
  UpsertBucketResponse,
} from '~api/types';

function validateDate(date: string): Date {
  const dateObject = new Date(date);
  if (!isValid(dateObject)) {
    throw badRequest('Invalid date');
  }
  return dateObject;
}

export async function listBuckets(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { date }: QueryListBucketsArgs,
): Promise<ListBucketsResponse> {
  const dateObject = validateDate(date);
  const startDate = formatISO(startOfMonth(dateObject), { representation: 'date' });
  const endDate = formatISO(endOfMonth(dateObject), { representation: 'date' });
  const bucketsRows = await Promise.all(
    Object.values(AnalysisPage).map((page) =>
      selectBucketsWithCurrentValue(db, uid, page, startDate, endDate),
    ),
  );
  const buckets = flatten(bucketsRows).map<Bucket>((row) => ({
    id: row.id,
    page: row.page,
    filterCategory: row.filter_category,
    expectedValue: row.value ?? 0,
    actualValue: row.value_actual,
  }));

  return {
    error: null,
    buckets,
  };
}

export async function upsertBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { date, id, bucket }: MutationUpsertBucketArgs,
): Promise<UpsertBucketResponse> {
  validateDate(date);
  if (id) {
    await updateBucket(db, uid, id, bucket);
  } else {
    await insertBucket(db, uid, bucket);
  }
  return listBuckets(db, uid, { date });
}

export async function getInvestmentBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<InvestmentBucket> {
  const value = await selectInvestmentBucket(db, uid);
  return { value: value ?? 0 };
}

export async function setInvestmentBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { value }: MutationSetInvestmentBucketArgs,
): Promise<SetInvestmentBucketResponse> {
  const updatedValue = await upsertInvestmentBucket(db, uid, value);
  return { error: null, bucket: { value: updatedValue } };
}
