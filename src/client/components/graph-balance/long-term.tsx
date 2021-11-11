import { useCallback, useMemo } from 'react';

import * as Styled from './styles';

import { FormFieldRange } from '~client/components/form-field';
import type { Props as RangeProps } from '~client/components/form-field/range';
import { ToggleContainer } from '~client/components/graph-cashflow/toggle';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { Button } from '~client/styled/shared';
import { SettingsFull, SettingsGroup } from '~client/styled/shared/settings';
import type { LongTermOptions, LongTermRates } from '~client/types';

export type Props = {
  options: LongTermOptions;
  setOptions: React.Dispatch<React.SetStateAction<LongTermOptions>>;
  defaultRates: Required<LongTermOptions['rates']>;
};

type RateSetterProps = {
  title: string;
  value: number;
  defaultValue: number;
  setValue: (value: number) => void;
} & Partial<RangeProps>;

const RateSetter: React.FC<RateSetterProps> = ({
  title,
  children,
  value,
  defaultValue,
  setValue,
  ...rangeProps
}) => (
  <Styled.RateSetter>
    <Styled.RateSetterMetadata>
      <Styled.RateTitle>{title}</Styled.RateTitle>
      <Styled.RateValue>{children}</Styled.RateValue>
    </Styled.RateSetterMetadata>
    <FormFieldRange {...rangeProps} value={value} onChange={setValue} />
  </Styled.RateSetter>
);

export const LongTermSettings: React.FC<Props> = ({ options, setOptions, defaultRates }) => {
  const toggleEnabled = useCallback(
    (action: React.SetStateAction<boolean>) =>
      setOptions((last) => ({
        ...last,
        enabled: typeof action === 'boolean' ? action : action(last.enabled),
      })),
    [setOptions],
  );

  const setRates = useCallback(
    (key: keyof LongTermRates) =>
      (value: LongTermRates[typeof key]): void =>
        setOptions((last) => ({ ...last, rates: { ...last.rates, [key]: value } })),
    [setOptions],
  );

  const setYears = useMemo(() => setRates('years'), [setRates]);
  const setIncome = useMemo(() => setRates('income'), [setRates]);
  const setInvestments = useMemo(() => setRates('stockPurchase'), [setRates]);
  const setXIRR = useMemo(() => setRates('xirr'), [setRates]);

  const years = options.rates.years ?? defaultRates.years;
  const income = options.rates.income ?? defaultRates.income;
  const investments = options.rates.stockPurchase ?? defaultRates.stockPurchase;
  const xirr = options.rates.xirr ?? defaultRates.xirr;

  const reset = useCallback(
    () => setOptions((last) => ({ ...last, enabled: true, rates: { ...defaultRates, years } })),
    [defaultRates, setOptions, years],
  );

  return (
    <>
      <SettingsGroup>
        <SettingsFull>
          <ToggleContainer value={options.enabled} setValue={toggleEnabled}>
            Long term
          </ToggleContainer>
        </SettingsFull>
      </SettingsGroup>
      {options.enabled && (
        <>
          <SettingsGroup>
            <SettingsFull>
              <Button onClick={reset}>Reset</Button>
            </SettingsFull>
          </SettingsGroup>
          <SettingsGroup>
            <SettingsFull>
              <RateSetter
                title="Years"
                value={years}
                defaultValue={defaultRates.years}
                setValue={setYears}
                min={1}
                max={30}
                step={1}
              >
                {years}
              </RateSetter>
            </SettingsFull>
          </SettingsGroup>
          <RateSetter
            title="Income"
            value={income}
            defaultValue={defaultRates.income}
            setValue={setIncome}
            min={0}
            step={10000}
            max={defaultRates.income * 5}
          >
            {formatCurrency(income)}
          </RateSetter>
          <RateSetter
            title="Invest"
            value={investments}
            defaultValue={defaultRates.stockPurchase}
            setValue={setInvestments}
            min={0}
            step={10000}
            max={defaultRates.stockPurchase * 5}
          >
            {formatCurrency(investments)}
          </RateSetter>
          <RateSetter
            title="XIRR"
            value={xirr}
            defaultValue={defaultRates.xirr}
            setValue={setXIRR}
            min={-1}
            step={0.001}
            max={1}
          >
            {formatPercent(xirr)}
          </RateSetter>
        </>
      )}
    </>
  );
};
