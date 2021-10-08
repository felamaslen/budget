import React, { useCallback, useMemo } from 'react';
import { replaceAtIndex } from 'replace-array';

import { usePlanningContext, usePlanningDispatch } from './context';
import { PropsRateForm, PropsThresholdForm, RateForm, ThresholdForm } from './form/rate';
import { SidebarSection } from './sidebar-section';

import { StandardRates, StandardThresholds } from '~shared/planning';

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

export const Rates: React.FC = () => {
  const { state } = usePlanningContext();
  const sync = usePlanningDispatch();

  const rates = state.parameters?.rates ?? [];
  const thresholds = state.parameters?.thresholds ?? [];

  const setParam = useCallback(
    (key: 'rates' | 'thresholds') => (name: string, value = 0): void => {
      sync((last) => {
        if (!last.parameters[key].some((compare) => compare.name === name)) {
          return {
            ...last,
            parameters: {
              ...last.parameters,
              [key]: [...last.parameters[key], { name, value }],
            },
          };
        }
        return {
          ...last,
          parameters: {
            ...last.parameters,
            [key]: replaceAtIndex(
              last.parameters[key],
              last.parameters[key].findIndex((compare) => compare.name === name),
              (prevValue) => ({
                ...prevValue,
                value: value ?? prevValue.value,
              }),
            ),
          },
        };
      });
    },
    [sync],
  );

  const setRate = useMemo(() => setParam('rates'), [setParam]);
  const setThreshold = useMemo(() => setParam('thresholds'), [setParam]);

  return (
    <SidebarSection title="Rates" initialOpen>
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
    </SidebarSection>
  );
};
