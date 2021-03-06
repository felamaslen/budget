import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import formatDate from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import getMonth from 'date-fns/getMonth';
import setMonth from 'date-fns/setMonth';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { CombinedError } from 'urql';

import type { BucketState, SkipDate, ViewOption } from './types';

import { useUpsertBucketMutation, useSetInvestmentBucketMutation } from '~client/hooks/gql';
import { formatCurrency } from '~client/modules/format';
import { getInvestmentsBetweenDates } from '~client/selectors';
import { AnalysisPage, Bucket, useListBucketsQuery } from '~client/types/gql';

function getTitle(startDate: Date, endDate: Date, viewOption: ViewOption): string {
  const { numMonthsInView, renderTitle } = viewOption;
  if (renderTitle) {
    return renderTitle(startDate, endDate);
  }
  if (numMonthsInView >= 12) {
    return formatDate(startDate, 'yyyy');
  }
  if (numMonthsInView > 1) {
    return `${formatDate(startDate, 'MMMM, yyyy')} to ${formatDate(endDate, 'MMMM, yyyy')}`;
  }
  return formatDate(startDate, 'MMMM yyyy');
}

function getStartDate(date: Date, viewOption: ViewOption): Date {
  const { numMonthsInView, monthOffset = 0 } = viewOption;
  if (numMonthsInView >= 12) {
    return addMonths(startOfYear(date), monthOffset);
  }
  if (numMonthsInView > 1) {
    return startOfMonth(
      setMonth(date, Math.floor(getMonth(date) / numMonthsInView) * numMonthsInView),
    );
  }
  return startOfMonth(date);
}

const normaliseValue = (value: number, numMonthsInView: number): number =>
  Math.max(0, Math.round(value / numMonthsInView));

export function useDate(
  viewOption: ViewOption,
): {
  startDate: Date;
  startDateString: string;
  endDate: Date;
  endDateString: string;
  description: string;
  skipDate: SkipDate;
} {
  const [date, setDate] = useState<Date>(getStartDate(new Date(), viewOption));
  useEffect(() => {
    setDate(getStartDate(new Date(), viewOption));
  }, [viewOption]);

  const skipDate = useCallback(
    (direction: -1 | 1) =>
      setDate((last) => addMonths(last, direction * viewOption.numMonthsInView)),
    [viewOption.numMonthsInView],
  );

  const startDate = useMemo(() => startOfMonth(date), [date]);
  const endDate = useMemo(() => endOfMonth(addMonths(date, viewOption.numMonthsInView - 1)), [
    date,
    viewOption.numMonthsInView,
  ]);

  return {
    startDate,
    startDateString: formatISO(startDate, { representation: 'date' }),
    endDate,
    endDateString: formatISO(endDate, { representation: 'date' }),
    description: getTitle(startDate, endDate, viewOption),
    skipDate,
  };
}

const initialBucketState: BucketState = {
  buckets: [],
  investmentBucket: { expectedValue: 0, purchaseValue: 0 },
};

export function moveBucketRemainderToCatchAll(buckets: Bucket[]): Bucket[] {
  return flatten(
    Object.values(groupBy(buckets, 'page')).map<Bucket[]>((pageBuckets) => {
      const catchAllBucket = pageBuckets.find((bucket) => !bucket.filterCategory) as Bucket;
      const nonCatchAllBuckets = pageBuckets.filter((bucket) => !!bucket.filterCategory);
      const leftover = Math.max(
        0,
        nonCatchAllBuckets.reduce<number>(
          (last, bucket) => last + bucket.expectedValue - bucket.actualValue,
          0,
        ),
      );
      return [
        {
          ...catchAllBucket,
          actualValue: catchAllBucket.actualValue - leftover,
        },
        ...nonCatchAllBuckets,
      ];
    }),
  );
}

const multiplyBucketValues = (numMonthsInView: number) => (buckets: Bucket[]): Bucket[] =>
  buckets.map<Bucket>(
    (bucket: Bucket): Bucket => ({
      ...bucket,
      expectedValue: bucket.expectedValue * numMonthsInView, // always based to 1 month on the server
    }),
  );

export function useBuckets(
  startDate: string,
  endDate: string,
  numMonthsInView: number,
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
    variables: { startDate, endDate },
    requestPolicy: 'network-only',
  });

  useEffect(() => {
    if (!fetching) {
      setBucketState((last) => ({
        buckets: data?.listBuckets?.buckets
          ? compose(
              multiplyBucketValues(numMonthsInView),
              moveBucketRemainderToCatchAll,
            )(data.listBuckets.buckets)
          : last.buckets,
        investmentBucket: data?.listBuckets?.investmentBucket
          ? {
              ...data.listBuckets.investmentBucket,
              expectedValue: data.listBuckets.investmentBucket.expectedValue * numMonthsInView,
            }
          : last.investmentBucket,
      }));
    }
  }, [data, fetching, numMonthsInView]);

  return [bucketState, setBucketState, { fetching, error, refresh }];
}

export function useBucketsMutation(
  startDate: string,
  endDate: string,
  setBucketState: React.Dispatch<React.SetStateAction<BucketState>>,
  numMonthsInView: number,
): (bucket: Bucket) => void {
  const [mutationResult, runMutation] = useUpsertBucketMutation();
  useEffect(() => {
    if (!mutationResult.fetching && mutationResult.data?.upsertBucket) {
      setBucketState((last) => ({
        ...last,
        buckets: mutationResult.data?.upsertBucket?.buckets
          ? compose(
              multiplyBucketValues(numMonthsInView),
              moveBucketRemainderToCatchAll,
            )(mutationResult.data.upsertBucket.buckets)
          : last.buckets,
      }));
    }
  }, [setBucketState, numMonthsInView, mutationResult.fetching, mutationResult.data]);

  const upsertBucket = useCallback(
    (bucket: Bucket) => {
      runMutation({
        startDate,
        endDate,
        id: bucket.id,
        bucket: {
          page: bucket.page,
          filterCategory: bucket.filterCategory,
          value: normaliseValue(bucket.expectedValue, numMonthsInView),
        },
      });
    },
    [runMutation, numMonthsInView, startDate, endDate],
  );

  return upsertBucket;
}

export function useInvestmentBucketMutation(
  setBucketState: React.Dispatch<React.SetStateAction<BucketState>>,
  numMonthsInView: number,
): (expectedValue: number) => void {
  const [mutationResult, runMutation] = useSetInvestmentBucketMutation();
  useEffect(() => {
    if (!mutationResult.fetching && mutationResult.data?.setInvestmentBucket) {
      setBucketState((last) => ({
        ...last,
        investmentBucket: mutationResult.data?.setInvestmentBucket
          ? {
              ...last.investmentBucket,
              expectedValue:
                (mutationResult.data.setInvestmentBucket.expectedValue ?? 0) * numMonthsInView,
            }
          : last.investmentBucket,
      }));
    }
  }, [setBucketState, numMonthsInView, mutationResult.fetching, mutationResult.data]);

  const setInvestmentBucket = useCallback(
    (expectedValue: number) => {
      runMutation({ value: normaliseValue(expectedValue, numMonthsInView) });
    },
    [runMutation, numMonthsInView],
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
  { buckets, investmentBucket }: BucketState,
): ActualValues {
  const actualStockInvested = useSelector(getInvestmentsBetweenDates(startDate, endDate));
  const actualInvestmentPurchases = investmentBucket.purchaseValue;
  const actualInvestedCapped = Math.max(0, actualStockInvested + actualInvestmentPurchases);

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
        { funds: investmentBucket.expectedValue } as ExpectedValues,
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
