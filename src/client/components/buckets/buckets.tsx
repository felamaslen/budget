import formatDate from 'date-fns/format';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import DotLoader from 'react-spinners/BarLoader';

import { BucketGroup, BucketGroupInvestment } from './group';
import { HealthIndicator, OverallHealth } from './health';
import {
  useActualValues,
  useBuckets,
  useBucketsMutation,
  useDate,
  useExpectedValues,
  useHealthStatus,
  useInvestmentBucketMutation,
} from './hooks';
import * as Styled from './styles';
import type { ViewOption, ViewOptionKey } from './types';

import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { ModalWindow, useCloseModal } from '~client/components/modal-window';
import { usePersistentState } from '~client/hooks';
import { AnalysisPage } from '~client/types/gql';

const viewOptions: Record<ViewOptionKey, ViewOption> = {
  month: { numMonthsInView: 1 },
  twoMonth: { numMonthsInView: 2 },
  quarter: { numMonthsInView: 3 },
  year: { numMonthsInView: 12 },
  financialYear: {
    numMonthsInView: 12,
    monthOffset: 3,
    renderTitle: (startDate, endDate): string =>
      `FY ${formatDate(startDate, 'yy')}/${formatDate(endDate, 'yy')}`,
  },
};

const viewOptionsSelect: SelectOptions<ViewOptionKey> = [
  { internal: 'month', external: 'Month' },
  { internal: 'twoMonth', external: 'Two-Month' },
  { internal: 'quarter', external: 'Quarter' },
  { internal: 'year', external: 'Year' },
  { internal: 'financialYear', external: 'Financial year' },
];

export const Buckets: React.FC<RouteComponentProps> = ({ history }) => {
  const [viewOptionKey, setViewOptionKey] = usePersistentState<ViewOptionKey>(
    'year',
    'bucket_view_option',
    (value) => typeof value === 'string' && value in viewOptions,
  );
  const viewOption = viewOptions[viewOptionKey];
  const { description, startDate, startDateString, endDate, endDateString, skipDate } = useDate(
    viewOption,
  );

  const [bucketState, setBucketState, { fetching, error, refresh }] = useBuckets(
    startDateString,
    endDateString,
    viewOption.numMonthsInView,
  );

  const upsertBucket = useBucketsMutation(
    startDateString,
    endDateString,
    setBucketState,
    viewOption.numMonthsInView,
  );
  const setInvestmentBucket = useInvestmentBucketMutation(
    setBucketState,
    viewOption.numMonthsInView,
  );

  const actualValues = useActualValues(startDate, endDate, bucketState);
  const expectedValues = useExpectedValues(bucketState);

  const [healthy, healthStatus] = useHealthStatus(expectedValues, actualValues);

  const onClosed = useCloseModal(history);

  return (
    <ModalWindow title="Buckets" onClosed={onClosed} width={600}>
      <Styled.Main>
        <Styled.TitleBar>
          <Styled.PrevButton onClick={(): void => skipDate(-1)}>Previous</Styled.PrevButton>
          <Styled.PeriodSwitcher>
            <FormFieldSelect
              value={viewOptionKey}
              options={viewOptionsSelect}
              onChange={setViewOptionKey}
            />
          </Styled.PeriodSwitcher>
          <Styled.DateTitle>{description}</Styled.DateTitle>
          <Styled.RefreshButton onClick={(): void => refresh()}>&#8635;</Styled.RefreshButton>
          <Styled.NextButton onClick={(): void => skipDate(1)}>Next</Styled.NextButton>
        </Styled.TitleBar>
        <OverallHealth actualValues={actualValues} expectedValues={expectedValues} />
        <Styled.BucketGroupList>
          {Object.entries(AnalysisPage).map(([key, page]) => (
            <BucketGroup
              key={key}
              page={page}
              buckets={bucketState.buckets
                .filter((bucket) => bucket.page === page)
                .sort((a) => (a.filterCategory === null ? -1 : 0))}
              upsertBucket={upsertBucket}
            />
          ))}
          <BucketGroupInvestment
            key="investment"
            actualValue={actualValues.funds}
            bucket={bucketState.investmentBucket}
            setInvestmentBucket={setInvestmentBucket}
          />
        </Styled.BucketGroupList>
        <Styled.StatusBar>
          {fetching && <DotLoader />}
          {error && <Styled.ErrorStatus>{error.message}</Styled.ErrorStatus>}
          <Styled.Filler />
          <Styled.HealthStatus>
            {healthStatus}
            <HealthIndicator healthy={healthy} />
          </Styled.HealthStatus>
        </Styled.StatusBar>
      </Styled.Main>
    </ModalWindow>
  );
};
export default withRouter(Buckets);
