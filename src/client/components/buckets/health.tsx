import omit from 'lodash/omit';
import React from 'react';

import { ActualValues, ExpectedValues, getRecordSum } from './hooks';
import * as Styled from './styles';

import { formatCurrency, formatPercent, getTickSize } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { AnalysisPage } from '~client/types/gql';

export type HealthIndicatorProps = {
  healthy: boolean;
  healthText?: string | null;
};

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ healthText, healthy }) => (
  <span role="img" aria-label="health" title={healthText ?? undefined}>
    {healthy ? '✔️' : '⚠️'}
  </span>
);

export type Props = {
  expectedValues: ExpectedValues;
  actualValues: ActualValues;
};

const nonIncomePages = Object.entries(AnalysisPage).filter(
  ([, page]) => page !== AnalysisPage.Income,
);

const spendingCategories: [string, AnalysisPage | 'funds'][] = [
  ...nonIncomePages,
  ['funds', 'funds'],
];

export const OverallHealth: React.FC<Props> = ({ actualValues, expectedValues }) => {
  const expectedNonIncome = getRecordSum(omit(expectedValues, AnalysisPage.Income));
  const actualNonIncome = getRecordSum(omit(actualValues, AnalysisPage.Income));

  const maxExpected = Math.max(expectedNonIncome, expectedValues.income);
  const maxActual = Math.max(actualNonIncome, actualValues.income);

  const maxValue = Math.max(maxExpected, maxActual);
  if (!maxValue) {
    return null;
  }

  const tickSize = getTickSize(0, maxValue, 10);
  const numTicks = Math.ceil(maxValue / tickSize);

  return (
    <Styled.OverallHealth>
      <Styled.HealthTargetWrapper>
        <Styled.HealthTargetWrapperInside>
          <Styled.HealthActual
            color={colors.income.main}
            style={{ width: formatPercent(actualValues.income / maxValue) }}
          />
        </Styled.HealthTargetWrapperInside>
        <Styled.HealthTargetWrapperInside>
          <Styled.HealthTarget
            color={colors.income.main}
            style={{ width: formatPercent(expectedValues.income / maxValue) }}
          />
        </Styled.HealthTargetWrapperInside>
      </Styled.HealthTargetWrapper>
      <Styled.HealthTargetWrapper>
        <Styled.HealthTargetWrapperInside>
          {spendingCategories.map(([, page]) => (
            <Styled.HealthActual
              key={page}
              color={colors[page].main}
              style={{ width: formatPercent(actualValues[page] / maxValue) }}
            />
          ))}
        </Styled.HealthTargetWrapperInside>
        <Styled.HealthTargetWrapperInside>
          {spendingCategories.map(([, page]) => (
            <Styled.HealthTarget
              key={page}
              color={colors[page].main}
              style={{ width: formatPercent(expectedValues[page] / maxValue) }}
            />
          ))}
        </Styled.HealthTargetWrapperInside>
      </Styled.HealthTargetWrapper>
      {tickSize && (
        <Styled.HealthAxis>
          {Array(Math.max(0, numTicks))
            .fill(0)
            .map((_, index) =>
              index === 0 ? null : (
                <span
                  key={`tick-${index}`}
                  style={{
                    position: 'absolute',
                    left: formatPercent((index * tickSize) / maxValue),
                  }}
                >
                  {formatCurrency(index * tickSize, { abbreviate: true })}
                </span>
              ),
            )}
        </Styled.HealthAxis>
      )}
    </Styled.OverallHealth>
  );
};
