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

import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { ModalWindow, useCloseModal } from '~client/components/modal-window';
import { usePersistentState } from '~client/hooks';
import { AnalysisPage } from '~client/types/gql';

const numMonthsInViewOptions: SelectOptions<number> = [
  { internal: 1, external: 'Month' },
  { internal: 2, external: 'Two-Month' },
  { internal: 3, external: 'Quarter' },
  { internal: 12, external: 'Year' },
];

export const Buckets: React.FC<RouteComponentProps> = ({ history }) => {
  const [numMonthsInView, setNumMonthsInView] = usePersistentState<number>(12, 'bucket_num_months');
  const { description, startDate, startDateString, endDate, endDateString, skipDate } = useDate(
    numMonthsInView,
  );

  const [bucketState, setBucketState, { fetching, error, refresh }] = useBuckets(
    startDateString,
    endDateString,
    numMonthsInView,
  );

  const upsertBucket = useBucketsMutation(
    startDateString,
    endDateString,
    setBucketState,
    numMonthsInView,
  );
  const setInvestmentBucket = useInvestmentBucketMutation(setBucketState, numMonthsInView);

  const actualValues = useActualValues(startDate, endDate, bucketState.buckets);
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
              value={numMonthsInView}
              options={numMonthsInViewOptions}
              onChange={setNumMonthsInView}
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
