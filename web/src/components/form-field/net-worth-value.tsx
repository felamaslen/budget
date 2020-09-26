import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { replaceAtIndex, removeAtIndex } from 'replace-array';

import { FormFieldCost } from './cost';
import { FormFieldNumber } from './number';
import { FormFieldSelect, SelectOptions } from './select';
import * as Styled from './styles';
import { FormFieldTickbox } from './tickbox';
import { NULL } from '~client/modules/data';
import { ButtonDelete, ButtonAdd } from '~client/styled/shared';
import { Value, Currency, isComplex, isFX, isOption, OptionValue, FXValue } from '~client/types';

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

type Props = {
  id: string;
  value: Value;
  isOption?: boolean;
  onChange: (value: Value) => void;
  currencies: Omit<Currency, 'id'>[];
};

const coerceSimpleFXValue = (value: Value): number | FXValue[] => {
  if (isComplex(value) && value.every(isFX)) {
    return value as FXValue[];
  }
  return isComplex(value) ? 0 : value;
};

type State = {
  simpleValue: number;
  fxValue: FXValue[];
  selected: 'simpleValue' | 'fxValue';
};

type PropsFieldSimpleFX = Pick<Props, 'value' | 'currencies'> & {
  onChange: (value: number | FXValue[]) => void;
};

const FormFieldSimpleFX: React.FC<PropsFieldSimpleFX> = ({
  value: initialValue,
  onChange,
  currencies,
}) => {
  const initialValueCoerced = useMemo(() => coerceSimpleFXValue(initialValue), [initialValue]);

  const [{ simpleValue, fxValue, selected }, setState] = useState<State>({
    simpleValue: isComplex(initialValueCoerced) ? 0 : initialValueCoerced,
    fxValue: isComplex(initialValueCoerced) ? initialValueCoerced : [],
    selected: isComplex(initialValueCoerced) ? 'fxValue' : 'simpleValue',
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
      simpleValue: isComplex(initialValueCoerced) ? last.simpleValue : initialValueCoerced,
      fxValue: isComplex(initialValueCoerced) ? initialValueCoerced : last.fxValue,
      selected: isComplex(initialValueCoerced) ? 'fxValue' : 'simpleValue',
    }));
  }, [initialValueCoerced]);

  const currencyOptions = useMemo(() => currencies.map(({ currency }) => currency), [currencies]);

  const otherCurrencyOptions = useMemo<string[]>(() => {
    if (selected === 'simpleValue') {
      return [];
    }

    return currencyOptions.filter((option) => !fxValue.some(({ currency }) => currency === option));
  }, [currencyOptions, selected, fxValue]);

  const onChangeComplexValue = useCallback(
    ({ index, value, currency }: FXEventChange) => {
      const fxValueUnchanged =
        value === fxValue[index]?.value && currency === fxValue[index]?.currency;
      if (fxValueUnchanged) {
        return;
      }

      onChange(replaceAtIndex(fxValue, index, { value, currency }));
    },
    [onChange, fxValue],
  );

  const onRemoveComplexValue = useCallback(
    ({ index }: FXEventRemove) => {
      if (fxValue.length < 2) {
        return;
      }
      onChange(removeAtIndex(fxValue, index));
    },
    [onChange, fxValue],
  );

  const onAddComplexValue = useCallback(
    ({ value, currency }: FXEventAdd) => onChange([...fxValue, { value, currency }]),
    [onChange, fxValue],
  );

  return (
    <>
      <Styled.NetWorthValueFXToggle>
        <FormFieldTickbox item="fx-toggle" value={selected === 'fxValue'} onChange={toggleFX} />
        {'FX'}
      </Styled.NetWorthValueFXToggle>
      {selected === 'simpleValue' && (
        <FormFieldCost value={simpleValue} onChange={(value = 0): void => onChange(value)} />
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
              onChange={onChangeComplexValue}
              onRemove={onRemoveComplexValue}
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
              onAdd={onAddComplexValue}
            />
          )}
        </Styled.NetWorthValueList>
      )}
    </>
  );
};

const coerceOptionValue = (value: Value): Partial<OptionValue> =>
  isComplex(value) ? value.find(isOption) ?? {} : {};

const optionDeltaComplete = (delta: Partial<OptionValue> | OptionValue): delta is OptionValue =>
  Object.keys(delta).length === 4 &&
  Object.values(delta).every((value) => typeof value !== 'undefined');

const unitsProps = { placeholder: 'Units' };
const vestedProps = { placeholder: 'Vested' };
const strikeProps = { placeholder: 'Strike price' };
const marketProps = { placeholder: 'Market price' };

type PropsFieldOption = Pick<Props, 'id' | 'value'> & {
  onChange: (value: OptionValue[]) => void;
};

const FormFieldOption: React.FC<PropsFieldOption> = ({ id, value, onChange }) => {
  const initialDelta = useMemo<Partial<OptionValue>>(() => coerceOptionValue(value), [value]);
  const [delta, setDelta] = useState<Partial<OptionValue>>(coerceOptionValue(value));
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
      onChange([delta]);
    }
  }, [delta, onChange]);

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

export const FormFieldNetWorthValue: React.FC<Props> = ({
  id,
  value,
  isOption: valueIsOption = false,
  onChange,
  currencies,
}) => {
  return (
    <Styled.NetWorthValue>
      {valueIsOption && <FormFieldOption id={id} value={value} onChange={onChange} />}
      {!valueIsOption && (
        <FormFieldSimpleFX value={value} onChange={onChange} currencies={currencies} />
      )}
    </Styled.NetWorthValue>
  );
};
