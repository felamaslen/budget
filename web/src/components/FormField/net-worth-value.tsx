import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { replaceAtIndex, removeAtIndex } from 'replace-array';

import {
  Value,
  Currency,
  isComplex,
  isFX,
  isOption,
  OptionValue,
  FXValue,
} from '~client/types/net-worth';
import { ButtonDelete, ButtonAdd } from '~client/styled/shared/button';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldNumber from '~client/components/FormField/number';
import FormFieldTickbox from '~client/components/FormField/tickbox';
import FormFieldSelect, { Options } from '~client/components/FormField/select';
import { NULL } from '~client/modules/data';

import * as Styled from './styles';

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
  const options = useMemo<Options>(
    () =>
      Array.from(new Set(currencyOptions.concat([currency]))).map(item => ({
        internal: item,
        external: item,
      })),
    [currencyOptions, currency],
  );

  const [newValue, setNewValue] = useState<number | undefined>(value);
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

const FormFieldSimpleFX: React.FC<Omit<Props, 'isOption'>> = ({
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
      setState(last => ({
        ...last,
        selected: last.selected === 'fxValue' ? 'simpleValue' : 'fxValue',
      })),
    [],
  );

  useEffect(() => {
    setState(last => ({
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

    return currencyOptions.filter(option => !fxValue.some(({ currency }) => currency === option));
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
  Object.keys(delta).length === 3 &&
  Object.values(delta).every(value => typeof value !== 'undefined');

const FormFieldOption: React.FC<Omit<Props, 'isOption' | 'currencies'>> = ({ value, onChange }) => {
  const initialDelta = useMemo<Partial<OptionValue>>(() => coerceOptionValue(value), [value]);
  const [delta, setDelta] = useState<Partial<OptionValue>>(coerceOptionValue(value));
  useEffect(() => {
    setDelta(initialDelta);
  }, [initialDelta]);

  const onChangeUnits = useCallback((units = 0) => setDelta(last => ({ ...last, units })), []);
  const onChangeStrike = useCallback(
    (strikePrice = 0) => setDelta(last => ({ ...last, strikePrice })),
    [],
  );
  const onChangeMarket = useCallback(
    (marketPrice = 0) => setDelta(last => ({ ...last, marketPrice })),
    [],
  );

  useEffect(() => {
    if (Object.keys(delta).length === 3 && optionDeltaComplete(delta)) {
      onChange([delta]);
    }
  }, [delta, onChange]);

  return (
    <Styled.NetWorthValueOption>
      <div>
        <label>Units</label>
        <FormFieldNumber placeholder="Units" value={delta.units ?? 0} onChange={onChangeUnits} />
      </div>
      <div>
        <label>Strike price</label>
        <FormFieldNumber
          placeholder="Strike price"
          value={delta.strikePrice ?? 0}
          onChange={onChangeStrike}
        />
        p
      </div>
      <div>
        <label>Market price</label>
        <FormFieldNumber
          placeholder="Market price"
          value={delta.marketPrice ?? 0}
          onChange={onChangeMarket}
        />
        p
      </div>
    </Styled.NetWorthValueOption>
  );
};

const FormFieldNetWorthValue: React.FC<Props> = ({
  value,
  isOption: valueIsOption = false,
  onChange,
  currencies,
}) => {
  return (
    <Styled.NetWorthValue>
      {valueIsOption && <FormFieldOption value={value} onChange={onChange} />}
      {!valueIsOption && (
        <FormFieldSimpleFX value={value} onChange={onChange} currencies={currencies} />
      )}
    </Styled.NetWorthValue>
  );
};

export default FormFieldNetWorthValue;
