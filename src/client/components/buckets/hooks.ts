import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import formatDate from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import startOfMonth from 'date-fns/startOfMonth';
import omit from 'lodash/omit';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { CombinedError } from 'urql';

import type { BucketState, SkipDate } from './types';

import { useUpsertBucketMutation, useSetInvestmentBucketMutation } from '~client/hooks/gql';
import { formatCurrency } from '~client/modules/format';
import { getInvestmentsBetweenDates } from '~client/selectors';
import { AnalysisPage, Bucket, InvestmentBucket, useListBucketsQuery } from '~client/types/gql';

export function useDate(): {
  date: string;
  startDate: Date;
  endDate: Date;
  description: string;
  skipDate: SkipDate;
} {
  const [date, setDate] = useState<Date>(startOfMonth(new Date()));
  const skipDate = useCallback(
    (direction: -1 | 1) => setDate((last) => addMonths(last, direction)),
    [],
  );

  const startDate = useMemo(() => startOfMonth(date), [date]);
  const endDate = useMemo(() => endOfMonth(date), [date]);
  const dateISO = formatISO(date, { representation: 'date' });

  return {
    date: dateISO,
    startDate,
    endDate,
    description: formatDate(date, 'MMMM yyyy'),
    skipDate,
  };
}

const initialBucketState: BucketState = {
  buckets: [],
  investmentBucket: { value: 0 },
};

export function useBuckets(
  date: string,
): [
  BucketState,
  Dispatch<SetStateAction<BucketState>>,
  {
    error: CombinedError | undefined;
    fetching: boolean;
    refresh: () => void;
  },
] {
  const [bucketState, setBucketState] = useState<BucketState>(initialBucketState);

  const [{ data, fetching, error }, refresh] = useListBucketsQuery({
    variables: { date },
    requestPolicy: 'network-only',
  });

  useEffect(() => {
    if (!fetching) {
      setBucketState((last) => ({
        buckets: data?.listBuckets?.buckets ?? last.buckets,
        investmentBucket: data?.getInvestmentBucket ?? last.investmentBucket,
      }));
    }
  }, [data, fetching]);

  return [bucketState, setBucketState, { fetching, error, refresh }];
}

export function useBucketsMutation(
  date: string,
  setBucketState: React.Dispatch<React.SetStateAction<BucketState>>,
): (bucket: Bucket) => void {
  const [mutationResult, runMutation] = useUpsertBucketMutation();
  useEffect(() => {
    if (!mutationResult.fetching && mutationResult.data?.upsertBucket) {
      setBucketState((last) => ({
        ...last,
        buckets: mutationResult.data?.upsertBucket?.buckets ?? last.buckets,
      }));
    }
  }, [setBucketState, mutationResult.fetching, mutationResult.data]);

  const upsertBucket = useCallback(
    (bucket: Bucket) => {
      runMutation({
        date,
        id: bucket.id,
        bucket: {
          page: bucket.page,
          filterCategory: bucket.filterCategory,
          value: bucket.expectedValue,
        },
      });
    },
    [runMutation, date],
  );

  return upsertBucket;
}

export function useInvestmentBucketMutation(
  setBucketState: React.Dispatch<React.SetStateAction<BucketState>>,
): (investmentBucket: InvestmentBucket) => void {
  const [mutationResult, runMutation] = useSetInvestmentBucketMutation();
  useEffect(() => {
    if (!mutationResult.fetching && mutationResult.data?.setInvestmentBucket) {
      setBucketState((last) => ({
        ...last,
        investmentBucket: mutationResult.data?.setInvestmentBucket?.bucket ?? last.investmentBucket,
      }));
    }
  }, [setBucketState, mutationResult.fetching, mutationResult.data]);

  const setInvestmentBucket = useCallback(
    (bucket: InvestmentBucket) => {
      runMutation(bucket);
    },
    [runMutation],
  );

  return setInvestmentBucket;
}

const getActualSumForPage = (buckets: Bucket[], page: AnalysisPage): number =>
  buckets
    .filter((bucket) => bucket.page === page)
    .reduce<number>((last, { actualValue }) => last + actualValue, 0);

export type ExpectedValues = Record<AnalysisPage | 'funds', number>;
export type ActualValues = ExpectedValues;

export function useActualValues(
  startDate: Date,
  endDate: Date,
  buckets: BucketState['buckets'],
): ActualValues {
  const actualInvested = useSelector(getInvestmentsBetweenDates(startDate, endDate));
  const actualInvestedCapped = Math.max(0, actualInvested);

  return useMemo(
    () =>
      Object.entries(AnalysisPage).reduce<ActualValues>(
        (last, [, page]) => ({
          ...last,
          [page]: getActualSumForPage(buckets, page),
        }),
        { funds: actualInvestedCapped } as ActualValues,
      ),
    [buckets, actualInvestedCapped],
  );
}

const getTargetSumForPage = (buckets: Bucket[], page: AnalysisPage): number =>
  buckets
    .filter((bucket) => bucket.page === page)
    .reduce<number>((last, { expectedValue }) => last + expectedValue, 0);

export function useExpectedValues({ buckets, investmentBucket }: BucketState): ExpectedValues {
  return useMemo(
    () =>
      Object.entries(AnalysisPage).reduce<ExpectedValues>(
        (last, [, page]) => ({
          ...last,
          [page]: getTargetSumForPage(buckets, page),
        }),
        { funds: investmentBucket.value } as ExpectedValues,
      ),
    [buckets, investmentBucket],
  );
}

export const getRecordSum = (record: Partial<Record<AnalysisPage | 'funds', number>>): number =>
  Object.values(record).reduce<number>((last, value = 0) => last + value, 0);

export function useHealthStatus(
  expectedValues: ExpectedValues,
  actualValues: ActualValues,
): [boolean, string | null] {
  const expectedNonIncome = getRecordSum(omit(expectedValues, AnalysisPage.Income));
  if (expectedNonIncome >= expectedValues.income) {
    return [
      false,
      `Budget exceeds income by ${formatCurrency(expectedNonIncome - expectedValues.income, {
        abbreviate: true,
      })}`,
    ];
  }
  const actualNonIncome = getRecordSum(omit(actualValues, AnalysisPage.Income));
  if (actualNonIncome >= actualValues.income) {
    return [
      false,
      `Overspent by ${formatCurrency(actualNonIncome - actualValues.income, { abbreviate: true })}`,
    ];
  }
  return [true, null];
}
