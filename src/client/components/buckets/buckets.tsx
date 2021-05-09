import addMonths from 'date-fns/addMonths';
import formatDate from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import startOfMonth from 'date-fns/startOfMonth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DotLoader from 'react-spinners/BarLoader';

import { BucketGroup } from './group';
import { OverallHealth } from './health';
import * as Styled from './styles';

import { ModalWindow } from '~client/components/modal-window';
import { Button } from '~client/styled/shared';
import {
  AnalysisPage,
  Bucket,
  useListBucketsQuery,
  useUpsertBucketMutation,
} from '~client/types/gql';

export type Props = {
  onClose: () => void;
};

const getTargetSumForPage = (buckets: Bucket[], page: AnalysisPage): number =>
  buckets
    .filter((bucket) => bucket.page === page)
    .reduce<number>((last, { expectedValue }) => last + expectedValue, 0);

const getActualSumForPage = (buckets: Bucket[], page: AnalysisPage): number =>
  buckets
    .filter((bucket) => bucket.page === page)
    .reduce<number>((last, { actualValue }) => last + actualValue, 0);

export const Buckets: React.FC<Props> = ({ onClose }) => {
  const [date, setDate] = useState<Date>(startOfMonth(new Date()));
  const skipDate = useCallback(
    (direction: -1 | 1) => setDate((last) => addMonths(last, direction)),
    [],
  );
  const dateISO = formatISO(date, { representation: 'date' });
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  const [{ data, fetching, error }] = useListBucketsQuery({
    variables: {
      date: dateISO,
    },
  });

  useEffect(() => {
    if (!fetching) {
      setBuckets(data?.listBuckets?.buckets ?? []);
    }
  }, [data, fetching]);

  const [mutationResult, runUpdateMutation] = useUpsertBucketMutation();
  useEffect(() => {
    if (!mutationResult.fetching && mutationResult.data?.upsertBucket) {
      setBuckets(mutationResult.data.upsertBucket.buckets ?? []);
    }
  }, [mutationResult.fetching, mutationResult.data]);

  const upsertBucket = useCallback(
    (bucket: Bucket) => {
      runUpdateMutation({
        date: dateISO,
        id: bucket.id,
        bucket: {
          page: bucket.page,
          filterCategory: bucket.filterCategory,
          value: bucket.expectedValue,
        },
      });
    },
    [runUpdateMutation, dateISO],
  );

  const actualValues = useMemo(
    () =>
      Object.entries(AnalysisPage).reduce<Record<AnalysisPage, number>>(
        (last, [, page]) => ({
          ...last,
          [page]: getActualSumForPage(buckets, page),
        }),
        {} as Record<AnalysisPage, number>,
      ),
    [buckets],
  );

  const expectedValues = useMemo(
    () =>
      Object.entries(AnalysisPage).reduce<Record<AnalysisPage, number>>(
        (last, [, page]) => ({
          ...last,
          [page]: getTargetSumForPage(buckets, page),
        }),
        {} as Record<AnalysisPage, number>,
      ),
    [buckets],
  );

  return (
    <ModalWindow title="Buckets" onClosed={onClose} width={600}>
      <Styled.Main>
        <Styled.TitleBar>
          <Button onClick={(): void => skipDate(-1)}>Previous</Button>
          <Styled.DateTitle>{formatDate(date, 'MMMM yyyy')}</Styled.DateTitle>
          <Button onClick={(): void => skipDate(1)}>Next</Button>
        </Styled.TitleBar>
        <OverallHealth actualValues={actualValues} expectedValues={expectedValues} />
        <Styled.BucketGroupList>
          {Object.entries(AnalysisPage).map(([key, page]) => (
            <BucketGroup
              key={key}
              page={page}
              buckets={buckets
                .filter((bucket) => bucket.page === page)
                .sort((a) => (a.filterCategory === null ? -1 : 0))}
              upsertBucket={upsertBucket}
            />
          ))}
        </Styled.BucketGroupList>
        <Styled.StatusBar>
          {fetching && <DotLoader />}
          {error && <Styled.ErrorStatus>{error.message}</Styled.ErrorStatus>}
        </Styled.StatusBar>
      </Styled.Main>
    </ModalWindow>
  );
};
