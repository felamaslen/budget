import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import axios from 'axios';
import debounce from 'debounce';
import shortid from 'shortid';

import { replaceAtIndex } from '~client/modules/data';
import FormFieldText from '~client/components/FormField';
import FormFieldNumber from '~client/components/FormField/number';
import { netWorthItem, currency as currencyShape } from '~client/components/NetWorthList/prop-types';
import FormContainer from '~client/components/NetWorthEditForm/form-container';

const BASE = 'GBP';

function validateRate(rate) {
    if (rate <= 0) {
        throw new Error('Rate must be positive');
    }

    return rate;
}

function validateCurrency(symbol, currencies = []) {
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

async function getCurrencies(symbols, source, onSuccess, onError, onComplete) {
    try {
        const res = await axios.get('https://api.exchangeratesapi.io/latest', {
            params: {
                base: BASE,
                symbols: symbols.join(',')
            },
            cancelToken: source.current.token
        });

        onSuccess(res.data);
    } catch (err) {
        if (!axios.isCancel(err)) {
            onError(err);
        }
    } finally {
        onComplete();
    }
}

const getCurrenciesDebounced = debounce((...args) => {
    getCurrencies(...args);
}, 100);

function useCurrencyApi(symbols) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const source = useRef(null);
    const [rates, setRates] = useState({});
    const [cacheTime, setCacheTime] = useState(null);

    const onSuccess = useCallback(({ rates: newRates }) => {
        setRates(Object.keys(newRates).reduce((last, symbol) => ({
            ...last,
            [symbol]: 1 / newRates[symbol]
        }), rates));

        setCacheTime(Date.now());
    }, [rates]);

    const onComplete = useCallback(() => {
        setLoading(false);
    }, []);

    const getRates = useCallback((extraSymbol = null) => {
        const allSymbols = Array.from(new Set(symbols.concat([extraSymbol])))
            .filter(value => value);

        const allCached = allSymbols.every(symbol => rates[symbol]);
        if (allCached && cacheTime && cacheTime > Date.now() - 3600 * 1000) {
            return;
        }

        if (source.current) {
            source.current.cancel('New request made');
        }
        source.current = axios.CancelToken.source();
        setLoading(true);

        getCurrenciesDebounced(allSymbols, source, onSuccess, setError, onComplete);
    }, [rates, cacheTime, symbols, onSuccess, onComplete]);

    useEffect(() => () => {
        if (source.current) {
            source.current.cancel('Component unmounted');
        }
    }, []);

    return [rates, getRates, loading, error];
}

function useRateRefresh(rates, getRates, loading, symbol, setRate) {
    const [readyToInsert, setReadyToInsert] = useState(false);
    const initRefresh = useCallback(() => {
        try {
            validateCurrency(symbol);
            setReadyToInsert(true);
            getRates(symbol);
        } catch (err) {
            // do nothing - invalid symbol
        }
    }, [getRates, symbol]);

    useEffect(() => {
        if (readyToInsert && rates[symbol]) {
            setRate(rates[symbol]);
            setReadyToInsert(false);
        }
    }, [symbol, setRate, readyToInsert, rates]);

    const button = useMemo(() => (
        <button
            className="button-refresh"
            disabled={loading}
            onClick={initRefresh}
        >&#8635;</button>
    ), [loading, initRefresh]);

    return [button, readyToInsert];
}

function EditCurrency({ entry, onChange, onRemove, rates, getRates, loadingRates }) {
    const [tempRate, setTempRate] = useState(entry.rate);
    const [error, setError] = useState(null);

    const [refreshButton, refreshing] = useRateRefresh(rates, getRates, loadingRates, entry.currency, setTempRate);

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
                <FormFieldNumber value={tempRate} onChange={setTempRate} disabled={refreshing} />
                {error && <span className="error">{error}</span>}
            </div>
            {refreshButton}
            <button className="button-delete" onClick={onRemoveCallback}>&minus;</button>
        </div>
    );
}

EditCurrency.propTypes = {
    entry: currencyShape.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    rates: PropTypes.object.isRequired,
    getRates: PropTypes.func.isRequired,
    loadingRates: PropTypes.bool.isRequired
};

function AddCurrency({ currencies, onAdd, rates, getRates, loadingRates }) {
    const [tempCurrency, setTempCurrency] = useState('USD');
    const [tempRate, setTempRate] = useState(0);

    const [refreshButton, refreshing] = useRateRefresh(rates, getRates, loadingRates, tempCurrency, setTempRate);

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
        <div className="edit-currency edit-currency-add">
            <h5 className="currency-title">{'Add a currency'}</h5>
            <div className="form-section">
                <FormFieldText value={tempCurrency} onChange={setTempCurrency} />
                <div className="input-group">
                    <FormFieldNumber value={tempRate} onChange={setTempRate} disabled={refreshing} />
                    {error && <span className="error">{error}</span>}
                </div>
                {refreshButton}
                <button className="button-add" onClick={onAddCallback}>+</button>
            </div>
        </div>
    );
}

AddCurrency.propTypes = {
    currencies: PropTypes.arrayOf(currencyShape.isRequired).isRequired,
    onAdd: PropTypes.func.isRequired,
    rates: PropTypes.object.isRequired,
    getRates: PropTypes.func.isRequired,
    loadingRates: PropTypes.bool.isRequired
};

export default function StepCurrencies({
    containerProps,
    item,
    onEdit
}) {
    const onAddValue = useCallback(currency => {
        const newCurrencies = item.currencies.concat([{
            id: shortid.generate(),
            ...currency
        }]);
        onEdit({ ...item, currencies: newCurrencies });
    }, [onEdit, item]);

    const onChangeValue = useCallback(currency => {
        const index = item.currencies.findIndex(({ id }) => id === currency.id);
        const newCurrencies = replaceAtIndex(item.currencies, index, currency);
        onEdit({ ...item, currencies: newCurrencies });
    }, [onEdit, item]);

    const onRemoveValue = useCallback(id => {
        const newCurrencies = item.currencies.filter(({ id: currencyId }) => currencyId !== id);
        onEdit({ ...item, currencies: newCurrencies });
    }, [onEdit, item]);

    const symbols = item.currencies.map(({ currency }) => currency);
    const [rates, getRates, loadingRates, errorRates] = useCurrencyApi(symbols);

    return (
        <FormContainer {...containerProps} className="step-currencies">
            <h5 className="net-worth-edit-form-section-title">
                {'Currencies - '}{item.date}
            </h5>
            {errorRates && <div className="error">
                {'Error loading rates: '}{errorRates.message}
            </div>}
            <div className={classNames('edit-currencies', { loading: loadingRates })}>
                {item.currencies.map(currency => (
                    <EditCurrency key={currency.id}
                        entry={currency}
                        onChange={onChangeValue}
                        onRemove={onRemoveValue}
                        rates={rates}
                        getRates={getRates}
                        loadingRates={loadingRates}
                    />
                ))}
                <AddCurrency key={0}
                    currencies={item.currencies}
                    onAdd={onAddValue}
                    rates={rates}
                    getRates={getRates}
                    loadingRates={loadingRates}
                />
            </div>
        </FormContainer>
    );
}

StepCurrencies.propTypes = {
    containerProps: PropTypes.object.isRequired,
    item: netWorthItem.isRequired,
    onEdit: PropTypes.func.isRequired
};
