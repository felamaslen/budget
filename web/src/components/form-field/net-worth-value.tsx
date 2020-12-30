import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { replaceAtIndex, removeAtIndex } from 'replace-array';

import { FormFieldCost } from './cost';
import { FormFieldNumber } from './number';
import { FormFieldSelect, SelectOptions } from './select';
import * as Styled from './styles';
import { FormFieldTickbox } from './tickbox';
import { NULL } from '~client/modules/data';
import { ButtonDelete, ButtonAdd } from '~client/styled/shared';
import {
  Currency,
  FxValue,
  OptionValue,
  MortgageValue,
  MortgageValueInput,
  NetWorthValueObjectRead as NetWorthValue,
  NetWorthValueObjectRead,
} from '~client/types';

type FXEventAdd = { value: number; currency: string };
type FXEventRemove = { index: number };
type FXEventChange = FXEventAdd & FXEventRemove;

type PropsWithCurrency = {
  add?: boolean;
  index: number;
  value: number;
  currency: string;
  currencyOptions: string[];
  onChange?: (value: FXEventChange) => void;
  onRemove?: (value: FXEventRemove) => void;
  onAdd?: (newValue: FXEventAdd) => void;
};

const FormFieldWithCurrency: React.FC<PropsWithCurrency> = ({
  add = false,
  index,
  value,
  currency,
  currencyOptions,
  onChange = NULL,
  onRemove,
  onAdd,
}) => {
  const options = useMemo<SelectOptions>(
    () =>
      Array.from(new Set(currencyOptions.concat([currency]))).map((item) => ({
        internal: item,
        external: item,
      })),
    [currencyOptions, currency],
  );

  const [newValue, setNewValue] = useState<number>(value);
  const [newCurrency, setNewCurrency] = useState<string>(currency);

  useEffect(() => {
    if (onChange && !(newValue === value && newCurrency === currency)) {
      onChange({ index, value: newValue || 0, currency: newCurrency });
    }
  }, [index, onChange, value, newValue, currency, newCurrency]);

  const onRemoveCallback = useCallback(() => {
    if (onRemove) {
      onRemove({ index });
    }
  }, [onRemove, index]);

  const onAddCallback = useCallback(() => {
    if (onAdd) {
      onAdd({ value: newValue || 0, currency: newCurrency });
    }
  }, [onAdd, newValue, newCurrency]);

  return (
    <Styled.NetWorthValueFX add={add}>
      <FormFieldNumber value={newValue} onChange={setNewValue} />
      <FormFieldSelect
        item="currency"
        options={options}
        value={newCurrency}
        onChange={setNewCurrency}
      />
      {onRemove && <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>}
      {onAdd && <ButtonAdd onClick={onAddCallback}>+</ButtonAdd>}
    </Styled.NetWorthValueFX>
  );
};

export type Props = {
  value: NetWorthValueObjectRead;
  onChange: React.Dispatch<React.SetStateAction<NetWorthValueObjectRead>>;
  currencies: Omit<Currency, 'id'>[];
  isOption?: boolean;
  isMortgage?: boolean;
};

const coerceSimpleFXValue = (value: NetWorthValue): number | FxValue[] =>
  value.fx ?? value.simple ?? 0;

const isFX = (value: number | FxValue[]): value is FxValue[] => Array.isArray(value);

type State = {
  simpleValue: number;
  fxValue: FxValue[];
  selected: 'simpleValue' | 'fxValue';
};

type PropsFieldSimpleFX = Pick<Props, 'value' | 'currencies' | 'onChange'>;

const FormFieldSimpleFX: React.FC<PropsFieldSimpleFX> = ({
  value: initialValue,
  onChange,
  currencies,
}) => {
  const initialValueCoerced = useMemo(() => coerceSimpleFXValue(initialValue), [initialValue]);

  const [{ simpleValue, fxValue, selected }, setState] = useState<State>({
    simpleValue: isFX(initialValueCoerced) ? 0 : initialValueCoerced,
    fxValue: isFX(initialValueCoerced) ? initialValueCoerced : [],
    selected: isFX(initialValueCoerced) ? 'fxValue' : 'simpleValue',
  });

  const toggleFX = useCallback(
    () =>
      setState((last) => ({
        ...last,
        selected: last.selected === 'fxValue' ? 'simpleValue' : 'fxValue',
      })),
    [],
  );

  useEffect(() => {
    setState((last) => ({
      ...last,
      simpleValue: isFX(initialValueCoerced) ? last.simpleValue : initialValueCoerced,
      fxValue: isFX(initialValueCoerced) ? initialValueCoerced : last.fxValue,
      selected: isFX(initialValueCoerced) ? 'fxValue' : 'simpleValue',
    }));
  }, [initialValueCoerced]);

  const currencyOptions = useMemo(() => currencies.map(({ currency }) => currency), [currencies]);

  const otherCurrencyOptions = useMemo<string[]>(() => {
    if (selected === 'simpleValue') {
      return [];
    }

    return currencyOptions.filter((option) => !fxValue.some(({ currency }) => currency === option));
  }, [currencyOptions, selected, fxValue]);

  const onChangeFXValue = useCallback(
    ({ index, value, currency }: FXEventChange) => {
      const fxValueUnchanged =
        value === fxValue[index]?.value && currency === fxValue[index]?.currency;
      if (fxValueUnchanged) {
        return;
      }

      onChange({
        ...initialValue,
        simple: null,
        fx: replaceAtIndex(fxValue, index, { value, currency }),
      });
    },
    [onChange, fxValue, initialValue],
  );

  const onRemoveFXValue = useCallback(
    ({ index }: FXEventRemove) => {
      if (fxValue.length < 2) {
        return;
      }
      onChange({
        ...initialValue,
        simple: null,
        fx: removeAtIndex(fxValue, index),
        option: null,
        mortgage: null,
      });
    },
    [onChange, fxValue, initialValue],
  );

  const onAddFXValue = useCallback(
    ({ value, currency }: FXEventAdd) =>
      onChange({
        ...initialValue,
        simple: null,
        fx: [...fxValue, { value, currency }],
        option: null,
        mortgage: null,
      }),
    [onChange, fxValue, initialValue],
  );

  const onChangeSimpleValue = useCallback(
    (value?: number) =>
      onChange({ ...initialValue, simple: value ?? 0, fx: null, option: null, mortgage: null }),
    [onChange, initialValue],
  );

  return (
    <>
      <Styled.NetWorthValueFXToggle>
        <FormFieldTickbox item="fx-toggle" value={selected === 'fxValue'} onChange={toggleFX} />
        {'FX'}
      </Styled.NetWorthValueFXToggle>
      {selected === 'simpleValue' && (
        <FormFieldCost value={simpleValue} onChange={onChangeSimpleValue} />
      )}
      {selected === 'fxValue' && (
        <Styled.NetWorthValueList>
          {fxValue.map(({ value, currency }, index) => (
            <FormFieldWithCurrency
              key={currency}
              index={index}
              value={value}
              currency={currency}
              currencyOptions={otherCurrencyOptions}
              onChange={onChangeFXValue}
              onRemove={onRemoveFXValue}
            />
          ))}
          {otherCurrencyOptions.length > 0 && (
            <FormFieldWithCurrency
              key={otherCurrencyOptions[0]}
              index={-1}
              value={0}
              currency={otherCurrencyOptions[0]}
              currencyOptions={otherCurrencyOptions}
              add
              onAdd={onAddFXValue}
            />
          )}
        </Styled.NetWorthValueList>
      )}
    </>
  );
};

const coerceOptionValue = <V extends NetWorthValue>(value: V): Partial<OptionValue> =>
  value.option ?? {};

const optionDeltaComplete = (delta: Partial<OptionValue> | OptionValue): delta is OptionValue =>
  Object.keys(delta).length === 4 &&
  Object.values(delta).every((value) => typeof value !== 'undefined');

const unitsProps = { placeholder: 'Units' };
const vestedProps = { placeholder: 'Vested' };
const strikeProps = { placeholder: 'Strike price' };
const marketProps = { placeholder: 'Market price' };

type PropsFieldOption = Pick<Props, 'value' | 'onChange'>;

const FormFieldOption: React.FC<PropsFieldOption> = ({ value, onChange }) => {
  const id = value.subcategory;
  const initialDelta = useMemo(() => coerceOptionValue(value), [value]);
  const [delta, setDelta] = useState(coerceOptionValue(value));
  useEffect(() => {
    setDelta(initialDelta);
  }, [initialDelta]);

  const onChangeUnits = useCallback((units = 0) => setDelta((last) => ({ ...last, units })), []);
  const onChangeVested = useCallback((vested = 0) => setDelta((last) => ({ ...last, vested })), []);
  const onChangeStrike = useCallback(
    (strikePrice = 0) => setDelta((last) => ({ ...last, strikePrice })),
    [],
  );
  const onChangeMarket = useCallback(
    (marketPrice = 0) => setDelta((last) => ({ ...last, marketPrice })),
    [],
  );

  useEffect(() => {
    if (optionDeltaComplete(delta)) {
      onChange((last) => ({ ...last, simple: null, fx: null, mortgage: null, option: delta }));
    }
  }, [delta, onChange, value.option]);

  return (
    <Styled.NetWorthValueOption>
      <div>
        <label htmlFor={`option-units-${id}`}>Units</label>
        <FormFieldNumber
          id={`option-units-${id}`}
          inputProps={unitsProps}
          value={delta.units ?? 0}
          onChange={onChangeUnits}
        />
      </div>
      <div>
        <label htmlFor={`option-vested-${id}`}>Vested</label>
        <FormFieldNumber
          id={`option-vested-${id}`}
          inputProps={vestedProps}
          value={delta.vested ?? 0}
          onChange={onChangeVested}
        />
      </div>
      <div>
        <label htmlFor={`option-strike-${id}`}>Strike price</label>
        <FormFieldNumber
          id={`option-strike-${id}`}
          inputProps={strikeProps}
          value={delta.strikePrice ?? 0}
          onChange={onChangeStrike}
        />
        p
      </div>
      <div>
        <label htmlFor={`option-market-${id}`}>Market price</label>
        <FormFieldNumber
          id={`option-market-${id}`}
          inputProps={marketProps}
          value={delta.marketPrice ?? 0}
          onChange={onChangeMarket}
        />
        p
      </div>
    </Styled.NetWorthValueOption>
  );
};

const coerceMortgage = <V extends NetWorthValue>(
  value: V,
): Partial<MortgageValue | MortgageValueInput> => value.mortgage ?? {};

const mortgageDeltaComplete = (
  delta: Partial<MortgageValue> | MortgageValue,
): delta is MortgageValue =>
  Object.keys(delta).length === 3 &&
  Object.values(delta).every((value) => typeof value !== 'undefined');

const principalProps = { placeholder: 'Principal' };
const paymentsRemainingProps = { placeholder: 'Payments remaining' };
const rateProps = { placeholder: 'Interest rate' };

type PropsFieldMortgage = Pick<Props, 'value' | 'onChange'>;

export const FormFieldMortgage: React.FC<PropsFieldMortgage> = ({ value, onChange }) => {
  const id = value.subcategory;
  const initialDelta = useMemo<Partial<MortgageValue>>(() => coerceMortgage(value), [value]);
  const [delta, setDelta] = useState<Partial<MortgageValue>>(coerceMortgage(value));
  useEffect(() => {
    setDelta(initialDelta);
  }, [initialDelta]);

  const onChangePrincipal = useCallback(
    (principal = 0) => setDelta((last) => ({ ...last, principal })),
    [],
  );
  const onChangePaymentsRemaining = useCallback(
    (paymentsRemaining = 0) =>
      setDelta((last) => ({ ...last, paymentsRemaining: Math.floor(paymentsRemaining) })),
    [],
  );
  const onChangeRate = useCallback((rate = 0) => setDelta((last) => ({ ...last, rate })), []);

  useEffect(() => {
    if (mortgageDeltaComplete(delta)) {
      onChange((last) => ({ ...last, simple: null, fx: null, option: null, mortgage: delta }));
    }
  }, [delta, onChange, value.mortgage]);

  return (
    <Styled.NetWorthValueMortgage>
      <div>
        <label htmlFor={`mortgage-principal-${id}`}>Principal</label>
        <FormFieldCost
          id={`mortgage-principal-${id}`}
          inputProps={principalProps}
          value={delta.principal ?? 0}
          onChange={onChangePrincipal}
        />
      </div>
      <div>
        <label htmlFor={`mortgage-payments-remaining-${id}`}>Payments remaining</label>
        <FormFieldNumber
          id={`mortgage-payments-remaining-${id}`}
          inputProps={paymentsRemainingProps}
          value={delta.paymentsRemaining ?? 0}
          onChange={onChangePaymentsRemaining}
          step={1}
          min={0}
        />
      </div>
      <div>
        <label htmlFor={`mortgage-rate-${id}`}>Interest rate</label>
        <FormFieldNumber
          id={`mortgage-rate-${id}`}
          inputProps={rateProps}
          value={delta.rate ?? 0}
          onChange={onChangeRate}
          min={0}
          step={0.001}
        />
      </div>
    </Styled.NetWorthValueMortgage>
  );
};

export const FormFieldNetWorthValue: React.FC<Props> = ({
  value,
  isOption: valueIsOption = false,
  isMortgage: valueIsMortgage = false,
  onChange,
  currencies,
}) => (
  <Styled.NetWorthValue>
    {valueIsMortgage && <FormFieldMortgage value={value} onChange={onChange} />}
    {valueIsOption && <FormFieldOption value={value} onChange={onChange} />}
    {!valueIsMortgage && !valueIsOption && (
      <FormFieldSimpleFX value={value} onChange={onChange} currencies={currencies} />
    )}
  </Styled.NetWorthValue>
);
