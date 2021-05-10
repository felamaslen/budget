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

import { ModalWindow, useCloseModal } from '~client/components/modal-window';
import { Button, ButtonRefresh } from '~client/styled/shared';
import { AnalysisPage } from '~client/types/gql';

export const Buckets: React.FC<RouteComponentProps> = ({ history }) => {
  const { date, description, startDate, endDate, skipDate } = useDate();

  const [bucketState, setBucketState, { fetching, error, refresh }] = useBuckets(date);

  const upsertBucket = useBucketsMutation(date, setBucketState);
  const setInvestmentBucket = useInvestmentBucketMutation(setBucketState);

  const actualValues = useActualValues(startDate, endDate, bucketState.buckets);
  const expectedValues = useExpectedValues(bucketState);

  const [healthy, healthStatus] = useHealthStatus(expectedValues, actualValues);

  const onClosed = useCloseModal(history);

  return (
    <ModalWindow title="Buckets" onClosed={onClosed} width={600}>
      <Styled.Main>
        <Styled.TitleBar>
          <Button onClick={(): void => skipDate(-1)}>Previous</Button>
          <Styled.DateTitle>{description}</Styled.DateTitle>
          <ButtonRefresh onClick={(): void => refresh()}>&#8635;</ButtonRefresh>
          <Button onClick={(): void => skipDate(1)}>Next</Button>
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
