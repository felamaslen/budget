import React from 'react';

import {
  BucketFilterForm,
  BucketForm,
  BucketFormProps,
  BucketInvestmentForm,
  BucketInvestmentFormProps,
} from './form';
import * as Styled from './styles';

import { formatCurrency } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { AnalysisPage, Bucket } from '~client/types/gql';

function getHealthText(page: string, actualValue: number, expectedValue: number): string | null {
  if (page === AnalysisPage.Income) {
    if (actualValue < expectedValue) {
      return `Income shortfall of ${formatCurrency(expectedValue - actualValue, {
        abbreviate: true,
      })}`;
    }
    return null;
  }
  if (actualValue > expectedValue) {
    return `Spending on ${page} is ${formatCurrency(actualValue - expectedValue, {
      abbreviate: true,
    })} in excess of budget`;
  }
  return null;
}

export type BucketGroupProps = {
  page: AnalysisPage;
  buckets: Bucket[];
} & Pick<BucketFormProps, 'upsertBucket'>;

export const BucketGroup: React.FC<BucketGroupProps> = ({ page, buckets, upsertBucket }) => (
  <Styled.BucketGroup color={colors[page].main}>
    <Styled.BucketGroupTitle>{page}</Styled.BucketGroupTitle>
    <Styled.BucketGroupFormList>
      {buckets.map((bucket) => (
        <BucketForm
          key={bucket.filterCategory ?? 'none'}
          bucket={bucket}
          healthy={
            bucket.page === AnalysisPage.Income
              ? bucket.actualValue >= bucket.expectedValue
              : bucket.actualValue <= bucket.expectedValue
          }
          healthText={getHealthText(
            bucket.filterCategory ?? bucket.page,
            bucket.actualValue,
            bucket.expectedValue,
          )}
          title={bucket.filterCategory ?? 'Catch-all'}
          upsertBucket={upsertBucket}
        />
      ))}
      <BucketFilterForm page={page} upsertBucket={upsertBucket} />
    </Styled.BucketGroupFormList>
  </Styled.BucketGroup>
);

export type BucketGroupInvestmentProps = Pick<
  BucketInvestmentFormProps,
  'actualValue' | 'bucket' | 'setInvestmentBucket'
>;

export const BucketGroupInvestment: React.FC<BucketGroupInvestmentProps> = ({
  actualValue,
  bucket,
  setInvestmentBucket,
}) => (
  <Styled.BucketGroup color={colors.funds.main}>
    <Styled.BucketGroupTitle>Investments</Styled.BucketGroupTitle>
    <Styled.BucketGroupFormList>
      <BucketInvestmentForm
        actualValue={actualValue}
        bucket={bucket}
        setInvestmentBucket={setInvestmentBucket}
        healthy={actualValue >= bucket.value}
        healthText={
          actualValue < bucket.value
            ? `Consider investing ${formatCurrency(bucket.value - actualValue, {
                abbreviate: true,
              })} more`
            : null
        }
      />
    </Styled.BucketGroupFormList>
  </Styled.BucketGroup>
);
