import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { replaceAtIndex } from '~client/modules/data';
import {
    netWorthValueSize,
    currency as currencyShape
} from '~client/components/NetWorthList/prop-types';
import { useInputTickbox, useInputSelect } from '~client/hooks/form';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldNumber from '~client/components/FormField/number';

function FormFieldWithCurrency({ className, index, value, currency, currencyOptions, onChange, onRemove, onAdd }) {
    const options = useMemo(() => Array.from(new Set(currencyOptions.concat([currency]))), [currencyOptions, currency]);

    const [newValue, setNewValue] = useState(value);
    const [newCurrency, InputCurrency] = useInputSelect(currency, options);

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
        <li className={classNames('form-field-net-worth-value-complex', className)}>
            <FormFieldNumber value={newValue} onChange={setNewValue} />
            {InputCurrency}
            {onRemove && (
                <button className="delete-button" onClick={onRemoveCallback}>&minus;</button>
            )}
            {onAdd && (
                <button className="add-button" onClick={onAddCallback}>+</button>
            )}
        </li>
    );
}

FormFieldWithCurrency.propTypes = {
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    currencyOptions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func
};

FormFieldWithCurrency.defaultProps = {
    className: {},
    onChange: () => null
};

export default function FormFieldNetWorthValue({ value, onChange, currencies }) {
    const isComplex = Array.isArray(value);
    const initialOtherValue = useMemo(() => {
        if (isComplex) {
            return 0;
        }

        return [];
    }, [isComplex]);
    const [otherValue, setOtherValue] = useState(initialOtherValue);
    const [complexToggle, InputToggleComplex] = useInputTickbox(isComplex);
    const [wasComplex, setWasComplex] = useState(complexToggle);

    useEffect(() => {
        if (complexToggle !== wasComplex) {
            setOtherValue(value);
            onChange(otherValue);
        }

        setWasComplex(complexToggle);
    }, [complexToggle, wasComplex, onChange, otherValue, value]);

    const currencyOptions = useMemo(() => currencies.map(({ currency }) => currency), [currencies]);

    const otherCurrencyOptions = useMemo(() => {
        if (!isComplex) {
            return null;
        }

        return currencyOptions.filter(option => !value.some(({ currency }) => currency === option));
    }, [isComplex, currencyOptions, value]);

    const onChangeComplexValue = useCallback(({ index, value: numberValue, currency }) => {
        if (!(numberValue === value[index].value && currency === value[index].currency)) {
            onChange(replaceAtIndex(value, index, { value: numberValue, currency }));
        }
    }, [onChange, value]);

    const onRemoveComplexValue = useCallback(({ index }) => {
        if (value.length < 2) {
            return;
        }

        onChange(value.slice(0, index).concat(value.slice(index + 1)));
    }, [onChange, value]);

    const onAddComplexValue = useCallback(({ value: numberValue, currency }) => {
        if (!numberValue) {
            return;
        }

        onChange(value.concat([{ value: numberValue, currency }]));
    }, [onChange, value]);

    return (
        <div className="form-field form-field-net-worth-value">
            <span className="complex-toggle">
                {InputToggleComplex}
                {'FX'}
            </span>
            {!isComplex && <FormFieldCost value={value} onChange={onChange} />}
            {isComplex && <ul>
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
                {otherCurrencyOptions.length && <FormFieldWithCurrency
                    key={otherCurrencyOptions[0]}
                    index={-1}
                    value={0}
                    currency={otherCurrencyOptions[0]}
                    currencyOptions={otherCurrencyOptions}
                    className="field-add"
                    onAdd={onAddComplexValue}
                /> || null}
            </ul>}
        </div>
    );
}

FormFieldNetWorthValue.propTypes = {
    value: netWorthValueSize.isRequired,
    onChange: PropTypes.func.isRequired,
    currencies: PropTypes.arrayOf(currencyShape.isRequired).isRequired
};
