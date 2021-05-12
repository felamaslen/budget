import React, { useCallback, useState } from 'react';

import { HealthIndicator, HealthIndicatorProps } from './health';
import * as Styled from './styles';

import { FormFieldCost, FormFieldText } from '~client/components/form-field';
import { formatPercent } from '~client/modules/format';
import { ButtonAdd } from '~client/styled/shared';
import { AnalysisPage, Bucket, InvestmentBucket } from '~client/types/gql';

export type BucketFormProps = {
  bucket: Bucket;
  title: string;
  upsertBucket: (bucket: Bucket) => void;
} & HealthIndicatorProps;

export const BucketForm: React.FC<BucketFormProps> = ({
  bucket,
  healthy,
  healthText,
  title,
  upsertBucket,
}) => {
  const maxValue = Math.max(bucket.expectedValue, bucket.actualValue);
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  return (
    <Styled.BucketForm>
      <Styled.BucketFormHealth>
        <Styled.BucketFormTitle onClick={(): void => setIsEditingCategory(true)}>
          {isEditingCategory ? (
            <FormFieldText
              value={bucket.filterCategory ?? ''}
              onChange={(filterCategory): void => {
                upsertBucket({ ...bucket, filterCategory: filterCategory || null });
              }}
              inputProps={{
                onKeyDown: (event): void => {
                  if (event.key === 'Escape') {
                    setIsEditingCategory(false);
                  }
                },
              }}
            />
          ) : (
            title
          )}
        </Styled.BucketFormTitle>
        <HealthIndicator healthy={healthy} healthText={healthText} />
      </Styled.BucketFormHealth>
      <Styled.BucketValuesIndicator>
        <Styled.BucketExpected
          style={{ height: maxValue ? formatPercent(bucket.expectedValue / maxValue) : 0 }}
        />
        <Styled.BucketActual
          style={{ height: maxValue ? formatPercent(bucket.actualValue / maxValue) : 0 }}
        />
      </Styled.BucketValuesIndicator>
      <Styled.BucketMeta>
        <FormFieldCost
          value={bucket.expectedValue}
          onChange={(expectedValue): void => upsertBucket({ ...bucket, expectedValue })}
          inputProps={{ autoComplete: 'off' }}
        />
      </Styled.BucketMeta>
    </Styled.BucketForm>
  );
};

export type BucketFilterFormProps = {
  page: AnalysisPage;
} & Pick<BucketFormProps, 'upsertBucket'>;

export const BucketFilterForm: React.FC<BucketFilterFormProps> = ({ page, upsertBucket }) => {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [expectedValue, setExpectedValue] = useState<number>(0);

  const addBucket = useCallback(() => {
    if (!filterCategory) {
      return;
    }
    upsertBucket({ id: 0, page, expectedValue, actualValue: 0, filterCategory });
  }, [upsertBucket, page, filterCategory, expectedValue]);

  return (
    <Styled.BucketFormNew>
      <Styled.Filler />
      <Styled.BucketMeta>
        <span>Category:</span>
        <FormFieldText value={filterCategory} onChange={setFilterCategory} />
      </Styled.BucketMeta>
      <Styled.BucketMeta>
        <span>Value:</span>
        <FormFieldCost value={expectedValue} onChange={setExpectedValue} />
      </Styled.BucketMeta>
      <Styled.BucketMeta>
        <Styled.AddBucketButtonContainer>
          <ButtonAdd onClick={addBucket}>+</ButtonAdd>
        </Styled.AddBucketButtonContainer>
      </Styled.BucketMeta>
      <Styled.Filler />
    </Styled.BucketFormNew>
  );
};

export type BucketInvestmentFormProps = {
  bucket: InvestmentBucket;
  actualValue: number;
  setInvestmentBucket: (bucket: InvestmentBucket) => void;
} & HealthIndicatorProps;

export const BucketInvestmentForm: React.FC<BucketInvestmentFormProps> = ({
  actualValue,
  bucket,
  healthy,
  healthText,
  setInvestmentBucket,
}) => {
  const maxValue = Math.max(bucket.value, actualValue);
  return (
    <Styled.BucketForm>
      <Styled.BucketFormHealth>
        <Styled.BucketFormTitle>Investments</Styled.BucketFormTitle>
        <HealthIndicator healthy={healthy} healthText={healthText} />
      </Styled.BucketFormHealth>
      <Styled.BucketValuesIndicator>
        <Styled.BucketExpected
          style={{ height: maxValue ? formatPercent(bucket.value / maxValue) : 0 }}
        />
        <Styled.BucketActual
          style={{ height: maxValue ? formatPercent(actualValue / maxValue) : 0 }}
        />
      </Styled.BucketValuesIndicator>
      <Styled.BucketMeta>
        <FormFieldCost
          value={bucket.value}
          onChange={(value): void => setInvestmentBucket({ value })}
          inputProps={{ autoComplete: 'off' }}
        />
      </Styled.BucketMeta>
    </Styled.BucketForm>
  );
};
