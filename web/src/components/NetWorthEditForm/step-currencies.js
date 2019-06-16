import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { replaceAtIndex } from '~client/modules/data';
import FormFieldText from '~client/components/FormField';
import FormFieldNumber from '~client/components/FormField/number';
import { netWorthItem, currency as currencyShape } from '~client/components/NetWorthList/prop-types';
import FormContainer from '~client/components/NetWorthEditForm/form-container';
import NextButton from '~client/components/NetWorthEditForm/next-button';

const BASE = 'GBP';

function validateRate(rate) {
    if (rate <= 0) {
        throw new Error('Rate must be positive');
    }

    return rate;
}

function validateCurrency(symbol, currencies) {
    if (currencies.some(({ currency }) => currency === symbol)) {
        throw new Error(`Duplicate currency ${symbol}`);
    }
    if (!symbol.match(/^[A-Z]{3}$/)) {
        throw new Error('Currency must be a symbol like USD or JPY');
    }

    const symbolUpper = symbol.toUpperCase();

    if (symbolUpper === BASE) {
        throw new Error(`Currency must not be ${BASE} (the base currency)`);
    }

    return symbolUpper;
}

function EditCurrency({ entry, onChange, onRemove }) {
    const [tempRate, setTempRate] = useState(entry.rate);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (tempRate !== entry.rate) {
            try {
                const rate = validateRate(tempRate);

                setError(null);
                onChange({ ...entry, rate });
            } catch (err) {
                setError(err.message);
            }
        }
    }, [tempRate, entry, onChange]);

    const onRemoveCallback = useCallback(() => {
        onRemove(entry.id);
    }, [onRemove, entry.id]);

    return (
        <div className="edit-currency">
            <h5 className="currency-title">{entry.currency}</h5>
            <div className="input-group">
                <FormFieldNumber value={tempRate} onChange={setTempRate} />
                {error && <span className="error">{error}</span>}
            </div>
            <button className="button-delete" onClick={onRemoveCallback}>&minus;</button>
        </div>
    );
}

EditCurrency.propTypes = {
    entry: currencyShape.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

function AddCurrency({ currencies, onAdd }) {
    const [tempCurrency, setTempCurrency] = useState('USD');
    const [tempRate, setTempRate] = useState(0);

    const [error, setError] = useState(null);

    const onAddCallback = useCallback(() => {
        try {
            const currency = validateCurrency(tempCurrency, currencies);
            const rate = validateRate(tempRate);

            setError(null);
            onAdd({ currency, rate });
        } catch (err) {
            setError(err.message);
        }
    }, [currencies, onAdd, tempCurrency, tempRate]);

    return (
        <div className="edit-currency">
            <h5 className="currency-title">{'Add a currency'}</h5>
            <FormFieldText value={tempCurrency} onChange={setTempCurrency} />
            <div className="input-group">
                <FormFieldNumber value={tempRate} onChange={setTempRate} />
                {error && <span className="error">{error}</span>}
            </div>
            <button className="button-add" onClick={onAddCallback}>+</button>
        </div>
    );
}

AddCurrency.propTypes = {
    currencies: PropTypes.arrayOf(currencyShape.isRequired).isRequired,
    onAdd: PropTypes.func.isRequired
};

export default function StepCurrencies({
    containerProps,
    item,
    onEdit,
    onNextStep,
    onLastStep
}) {
    const [numNew, setNumNew] = useState(0);

    const onAddValue = useCallback(currency => {
        const newCurrencies = item.currencies.concat([{
            id: -(numNew + 1),
            ...currency
        }]);
        setNumNew(numNew + 1);
        onEdit({ ...item, currencies: newCurrencies });
    }, [onEdit, numNew, item]);

    const onChangeValue = useCallback(currency => {
        const index = item.currencies.findIndex(({ id }) => id === currency.id);
        const newCurrencies = replaceAtIndex(item.currencies, index, currency);
        onEdit({ ...item, currencies: newCurrencies });
    }, [onEdit, item]);

    const onRemoveValue = useCallback(id => {
        const newCurrencies = item.currencies.filter(({ id: currencyId }) => currencyId !== id);
        onEdit({ ...item, currencies: newCurrencies });
    }, [onEdit, item]);

    return (
        <FormContainer {...containerProps}>
            <h4>{'Currencies - '}{item.date}</h4>
            <div className="edit-currencies">
                {item.currencies.map(currency => (
                    <EditCurrency key={currency.id}
                        entry={currency}
                        onChange={onChangeValue}
                        onRemove={onRemoveValue}
                    />
                ))}
                <AddCurrency key={0}
                    currencies={item.currencies}
                    onAdd={onAddValue}
                />
            </div>
            <NextButton onNextStep={onNextStep} onLastStep={onLastStep} />
        </FormContainer>
    );
}

StepCurrencies.propTypes = {
    containerProps: PropTypes.object.isRequired,
    item: netWorthItem.isRequired,
    onEdit: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onLastStep: PropTypes.bool.isRequired
};

