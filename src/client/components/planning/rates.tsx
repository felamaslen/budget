import React, { useCallback, useMemo } from 'react';
import { replaceAtIndex } from 'replace-array';

import { StandardRates, StandardThresholds } from './constants';
import { usePlanningDispatch, usePlanningState } from './context';
import { PropsRateForm, PropsThresholdForm, RateForm, ThresholdForm } from './form/rate';
import * as Styled from './styles';

export type Props = {
  year: number;
};

const standardRates: Pick<PropsRateForm, 'label' | 'name'>[] = [
  { name: StandardRates.IncomeTaxBasicRate, label: 'Income tax basic rate' },
  { name: StandardRates.IncomeTaxHigherRate, label: 'Income tax higher rate' },
  { name: StandardRates.IncomeTaxAdditionalRate, label: 'Income tax additional rate' },
  { name: StandardRates.NILowerRate, label: 'NIC lower rate' },
  { name: StandardRates.NIHigherRate, label: 'NIC higher rate' },
  { name: StandardRates.StudentLoanRate, label: 'Student loan rate' },
];

const standardThresholds: Pick<PropsThresholdForm, 'label' | 'name'>[] = [
  { name: StandardThresholds.IncomeTaxBasicAllowance, label: 'Income tax basic allowance' },
  {
    name: StandardThresholds.IncomeTaxAdditionalThreshold,
    label: 'Income tax additional rate threshold',
  },
  { name: StandardThresholds.NIPT, label: 'NIC primary threshold' },
  { name: StandardThresholds.NIUEL, label: 'NIC upper earnings limit' },
  { name: StandardThresholds.StudentLoanThreshold, label: 'Student loan threshold' },
];

export const Rates: React.FC<Props> = ({ year }) => {
  const state = usePlanningState();
  const dispatch = usePlanningDispatch();

  const parameters = state.parameters.find((compare) => compare.year === year);

  const rates = parameters?.rates ?? [];
  const thresholds = parameters?.thresholds ?? [];

  const setParam = useCallback(
    (key: 'rates' | 'thresholds') => (name: string, value = 0): void => {
      dispatch((last) => {
        const parametersForYear = last.parameters.find((compare) => compare.year === year);
        if (!parametersForYear) {
          return {
            ...last,
            parameters: [
              ...last.parameters,
              {
                year,
                rates: key === 'rates' ? [{ name, value }] : [],
                thresholds: key === 'thresholds' ? [{ name, value }] : [],
              },
            ],
          };
        }
        if (!parametersForYear[key].some((compare) => compare.name === name)) {
          return {
            ...last,
            parameters: replaceAtIndex(
              last.parameters,
              last.parameters.findIndex((compare) => compare.year === year),
              (prevParam) => ({
                ...prevParam,
                [key]: [...prevParam[key], { name, value }],
              }),
            ),
          };
        }
        return {
          ...last,
          parameters: replaceAtIndex(
            last.parameters,
            last.parameters.findIndex((compare) => compare.year === year),
            (prevParam) => ({
              ...prevParam,
              [key]: replaceAtIndex(
                prevParam[key],
                prevParam[key].findIndex((compare) => compare.name === name),
                (prevValue) => ({
                  ...prevValue,
                  value: value ?? prevValue.value,
                }),
              ),
            }),
          ),
        };
      });
    },
    [dispatch, year],
  );

  const setRate = useMemo(() => setParam('rates'), [setParam]);
  const setThreshold = useMemo(() => setParam('thresholds'), [setParam]);

  return (
    <Styled.Rates>
      {standardRates.map(({ name, label }) => (
        <RateForm
          key={name}
          label={label}
          name={name}
          rate={rates.find((compare) => compare.name === name)}
          setRate={setRate}
        />
      ))}
      {standardThresholds.map(({ name, label }) => (
        <ThresholdForm
          key={name}
          label={label}
          name={name}
          threshold={thresholds.find((compare) => compare.name === name)}
          setThreshold={setThreshold}
        />
      ))}
    </Styled.Rates>
  );
};
