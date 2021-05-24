import { badRequest } from '@hapi/boom';
import { formatISO, isValid } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';
import {
  insertBucket,
  selectBucketsWithCurrentValue,
  selectInvestmentBucket,
  updateBucket,
  upsertInvestmentBucket,
} from '~api/queries';
import {
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
  args: QueryListBucketsArgs,
): Promise<ListBucketsResponse> {
  const startDate = validateDate(args.startDate);
  const endDate = validateDate(args.endDate);
  const bucketsRows = await selectBucketsWithCurrentValue(
    db,
    uid,
    formatISO(startDate, { representation: 'date' }),
    formatISO(endDate, { representation: 'date' }),
  );
  const buckets = bucketsRows.map<Bucket>((row) => ({
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
  { startDate, endDate, id, bucket }: MutationUpsertBucketArgs,
): Promise<UpsertBucketResponse> {
  validateDate(startDate);
  validateDate(endDate);
  if (id) {
    await updateBucket(db, uid, id, bucket);
  } else {
    await insertBucket(db, uid, bucket);
  }
  return listBuckets(db, uid, { startDate, endDate });
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
