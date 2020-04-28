import React, { useReducer, useState, useCallback, useMemo, useEffect } from 'react';
import { replaceAtIndex } from 'replace-array';

import { Value, Currency, isComplex, isFX } from '~client/types/net-worth';
import { ButtonDelete, ButtonAdd } from '~client/styled/shared/button';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldNumber from '~client/components/FormField/number';
import FormFieldTickbox from '~client/components/FormField/tickbox';
import FormFieldSelect, { Options } from '~client/components/FormField/select';

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
  onChange = (): void => {
    // do nothing
  },
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
    <Styled.NetWorthValueComplex add={add}>
      <FormFieldNumber value={newValue} onChange={setNewValue} />
      <FormFieldSelect
        item="currency"
        options={options}
        value={newCurrency}
        onChange={setNewCurrency}
      />
      {onRemove && <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>}
      {onAdd && <ButtonAdd onClick={onAddCallback}>+</ButtonAdd>}
    </Styled.NetWorthValueComplex>
  );
};

enum ActionType {
  ComplexToggled,
  ValueSet,
}

type ActionComplexToggled = {
  type: ActionType.ComplexToggled;
};

type ActionValueSet = {
  type: ActionType.ValueSet;
  value: Value;
};

type Action = ActionComplexToggled | ActionValueSet;

type State = {
  complex: boolean;
  otherValue: Value;
  value: Value;
};

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (state, action): State => {
  if (action.type === ActionType.ComplexToggled) {
    return {
      ...state,
      complex: !state.complex,
      otherValue: state.value,
      value: state.otherValue,
    };
  }
  if (action.type === ActionType.ValueSet) {
    return { ...state, value: action.value };
  }

  return state;
};

export type Props = {
  value: Value;
  onChange: (value: Value) => void;
  currencies: Currency[];
};

const FormFieldNetWorthValue: React.FC<Props> = ({ value: initialValue, onChange, currencies }) => {
  const onChangeTruthy = useCallback(
    (newValue?: Value): void => {
      if (newValue) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  const [{ value, complex }, dispatch] = useReducer<Reducer>(reducer, {
    complex: isComplex(initialValue),
    otherValue: isComplex(initialValue) ? 0 : [],
    value: initialValue,
  });

  const toggleComplex = useCallback(() => {
    dispatch({ type: ActionType.ComplexToggled });
  }, []);

  useEffect(() => {
    if (complex !== isComplex(value) && value !== initialValue) {
      onChangeTruthy(value);
    }
  }, [onChangeTruthy, complex, value, initialValue]);

  useEffect(() => {
    dispatch({ type: ActionType.ValueSet, value: initialValue });
  }, [initialValue]);

  const currencyOptions = useMemo(() => currencies.map(({ currency }) => currency), [currencies]);

  const otherCurrencyOptions = useMemo<string[]>(() => {
    if (!isComplex(value)) {
      return [];
    }

    return currencyOptions.filter(
      option => !value.filter(isFX).some(({ currency }) => currency === option),
    );
  }, [currencyOptions, value]);

  const onChangeComplexValue = useCallback(
    ({ index, value: numberValue, currency }: FXEventChange) => {
      if (!isComplex(value)) {
        return;
      }
      const valueAtIndex = value[index];
      const fxValueUnchanged =
        isFX(valueAtIndex) &&
        numberValue === valueAtIndex.value &&
        currency === valueAtIndex.currency;

      if (fxValueUnchanged) {
        return;
      }

      onChangeTruthy(
        replaceAtIndex(value, index, {
          value: numberValue,
          currency,
        }),
      );
    },
    [onChangeTruthy, value],
  );

  const onRemoveComplexValue = useCallback(
    ({ index }: FXEventRemove) => {
      if (!isComplex(value) || value.length < 2) {
        return;
      }

      onChangeTruthy(value.slice(0, index).concat(value.slice(index + 1)));
    },
    [onChangeTruthy, value],
  );

  const onAddComplexValue = useCallback(
    ({ value: numberValue, currency }: FXEventAdd) => {
      if (!isComplex(value) || !numberValue) {
        return;
      }

      onChangeTruthy(value.concat([{ value: numberValue, currency }]));
    },
    [onChangeTruthy, value],
  );

  return (
    <Styled.NetWorthValue>
      <Styled.NetWorthValueComplexToggle>
        <FormFieldTickbox item="fx-toggle" value={isComplex(value)} onChange={toggleComplex} />
        {'FX'}
      </Styled.NetWorthValueComplexToggle>
      {!isComplex(value) && <FormFieldCost value={value} onChange={onChangeTruthy} />}
      {isComplex(value) && (
        <Styled.NetWorthValueList>
          {value.filter(isFX).map(({ value: numberValue, currency }, index) => (
            <FormFieldWithCurrency
              key={currency}
              index={index}
              value={numberValue}
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
    </Styled.NetWorthValue>
  );
};

export default FormFieldNetWorthValue;
