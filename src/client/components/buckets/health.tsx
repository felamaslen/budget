import React from 'react';
import * as Styled from './styles';
import { formatCurrency, formatPercent, getTickSize } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { AnalysisPage } from '~client/types/gql';

export type Props = {
  expectedValues: Record<AnalysisPage, number>;
  actualValues: Record<AnalysisPage, number>;
};

const nonIncomePages = Object.entries(AnalysisPage).filter(
  ([, page]) => page !== AnalysisPage.Income,
);

export const OverallHealth: React.FC<Props> = ({ actualValues, expectedValues }) => {
  const spendingTargetValue = nonIncomePages.reduce<number>(
    (last, [, page]) => last + expectedValues[page],
    0,
  );
  const spendingActualValue = nonIncomePages.reduce<number>(
    (last, [, page]) => last + actualValues[page],
    0,
  );

  const incomeTargetValue = expectedValues[AnalysisPage.Income];
  const incomeActualValue = actualValues[AnalysisPage.Income];

  const maxTargetValue = Math.max(spendingTargetValue, incomeTargetValue);
  const maxActualValue = Math.max(spendingActualValue, incomeActualValue);

  const maxValue = Math.max(maxTargetValue, maxActualValue);

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
            style={{ width: formatPercent(incomeActualValue / maxValue) }}
          />
        </Styled.HealthTargetWrapperInside>
        <Styled.HealthTargetWrapperInside>
          <Styled.HealthTarget
            color={colors.income.main}
            style={{ width: formatPercent(incomeTargetValue / maxValue) }}
          />
        </Styled.HealthTargetWrapperInside>
      </Styled.HealthTargetWrapper>
      <Styled.HealthTargetWrapper>
        <Styled.HealthTargetWrapperInside>
          {nonIncomePages.map(([, page]) => (
            <Styled.HealthActual
              key={page}
              color={colors[page].main}
              style={{ left: 0, width: formatPercent(actualValues[page] / maxValue) }}
            />
          ))}
        </Styled.HealthTargetWrapperInside>
        <Styled.HealthTargetWrapperInside>
          {nonIncomePages.map(([, page]) => (
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
