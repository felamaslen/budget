import React, { useReducer, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { replaceAtIndex } from '~client/modules/data';
import { netWorthValueSize, currency as currencyShape } from '~client/prop-types/net-worth/list';
import { ButtonDelete, ButtonAdd } from '~client/styled/shared/button';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldNumber from '~client/components/FormField/number';
import FormFieldTickbox from '~client/components/FormField/tickbox';
import FormFieldSelect from '~client/components/FormField/select';

import * as Styled from './styles';

function FormFieldWithCurrency({
    add,
    index,
    value,
    currency,
    currencyOptions,
    onChange,
    onRemove,
    onAdd,
}) {
    const options = useMemo(
        () =>
            Array.from(new Set(currencyOptions.concat([currency]))).map(item => ({
                internal: item,
                external: item,
            })),
        [currencyOptions, currency],
    );

    const [newValue, setNewValue] = useState(value);
    const [newCurrency, setNewCurrency] = useState(currency);

    useEffect(() => {
        if (!(newValue === value && newCurrency === currency)) {
            onChange({ index, value: newValue, currency: newCurrency });
        }
    }, [index, onChange, value, newValue, currency, newCurrency]);

    const onRemoveCallback = useCallback(() => {
        onRemove({ index });
    }, [onRemove, index]);

    const onAddCallback = useCallback(() => {
        onAdd({ value: newValue, currency: newCurrency });
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
}

FormFieldWithCurrency.propTypes = {
    add: PropTypes.bool,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    currencyOptions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func,
};

FormFieldWithCurrency.defaultProps = {
    add: false,
    onChange: () => null,
};

const COMPLEX_TOGGLED = 'COMPLEX_TOGGLED';
const VALUE_SET = 'VALUE_SET';

function complexValueReducer(state, action) {
    if (action.type === COMPLEX_TOGGLED) {
        return {
            ...state,
            complex: !state.complex,
            otherValue: state.value,
            value: state.otherValue,
        };
    }
    if (action.type === VALUE_SET) {
        return { ...state, value: action.value };
    }

    return state;
}

export default function FormFieldNetWorthValue({ value, onChange, currencies }) {
    const isComplex = Array.isArray(value);

    const [state, dispatch] = useReducer(complexValueReducer, {
        complex: isComplex,
        otherValue: isComplex ? 0 : [],
        value,
    });

    const toggleComplex = useCallback(() => {
        dispatch({ type: COMPLEX_TOGGLED, value });
    }, [value]);

    useEffect(() => {
        if (state.complex !== isComplex && value !== state.value) {
            onChange(state.value);
        }
    }, [onChange, state.complex, isComplex, value, state.value]);

    useEffect(() => {
        dispatch({ type: VALUE_SET, value });
    }, [value]);

    const currencyOptions = useMemo(() => currencies.map(({ currency }) => currency), [currencies]);

    const otherCurrencyOptions = useMemo(() => {
        if (!isComplex) {
            return null;
        }

        return currencyOptions.filter(option => !value.some(({ currency }) => currency === option));
    }, [isComplex, currencyOptions, value]);

    const onChangeComplexValue = useCallback(
        ({ index, value: numberValue, currency }) => {
            if (!(numberValue === value[index].value && currency === value[index].currency)) {
                onChange(
                    replaceAtIndex(value, index, {
                        value: numberValue,
                        currency,
                    }),
                );
            }
        },
        [onChange, value],
    );

    const onRemoveComplexValue = useCallback(
        ({ index }) => {
            if (value.length < 2) {
                return;
            }

            onChange(value.slice(0, index).concat(value.slice(index + 1)));
        },
        [onChange, value],
    );

    const onAddComplexValue = useCallback(
        ({ value: numberValue, currency }) => {
            if (!numberValue) {
                return;
            }

            onChange(value.concat([{ value: numberValue, currency }]));
        },
        [onChange, value],
    );

    return (
        <Styled.NetWorthValue>
            <Styled.NetWorthValueComplexToggle>
                <FormFieldTickbox item="fx-toggle" value={isComplex} onChange={toggleComplex} />
                {'FX'}
            </Styled.NetWorthValueComplexToggle>
            {!isComplex && <FormFieldCost value={value} onChange={onChange} />}
            {isComplex && (
                <Styled.NetWorthValueList>
                    {value.map(({ value: numberValue, currency }, index) => (
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
}

FormFieldNetWorthValue.propTypes = {
    value: netWorthValueSize.isRequired,
    onChange: PropTypes.func.isRequired,
    currencies: PropTypes.arrayOf(currencyShape.isRequired).isRequired,
};
