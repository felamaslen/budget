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
  const startDate = formatISO(validateDate(args.startDate), { representation: 'date' });
  const endDate = formatISO(validateDate(args.endDate), { representation: 'date' });
  const [bucketsRows, investmentBucketRows] = await Promise.all([
    selectBucketsWithCurrentValue(db, uid, startDate, endDate),
    selectInvestmentBucket(db, uid, startDate, endDate),
  ]);
  const buckets = bucketsRows.map<Bucket>((row) => ({
    id: row.id,
    page: row.page,
    filterCategory: row.filter_category,
    expectedValue: row.value ?? 0,
    actualValue: row.value_actual,
  }));
  const investmentBucket: InvestmentBucket = {
    expectedValue: investmentBucketRows[0]?.expected_value ?? 0,
    purchaseValue: investmentBucketRows[0]?.purchase_value ?? 0,
  };

  return {
    error: null,
    buckets,
    investmentBucket,
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

export async function setInvestmentBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { value }: MutationSetInvestmentBucketArgs,
): Promise<SetInvestmentBucketResponse> {
  const updatedValue = await upsertInvestmentBucket(db, uid, value);
  return { error: null, expectedValue: updatedValue };
}
