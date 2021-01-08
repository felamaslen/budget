import format from 'date-fns/format';
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { replaceAtIndex } from 'replace-array';
import { debounce } from 'throttle-debounce';

import { Step } from './constants';
import { FormContainer, Props as ContainerProps } from './form-container';
import * as Styled from './styles';
import { FormFieldText, FormFieldNumber } from '~client/components/form-field';
import { ButtonDelete, ButtonAdd, ButtonRefresh } from '~client/styled/shared';
import type { Create, NetWorthEntryNative as Entry } from '~client/types';
import type { CurrencyInput as Currency } from '~client/types/gql';

const BASE = 'GBP';

function validateRate(rate: number): number {
  if (rate <= 0) {
    throw new Error('Rate must be positive');
  }
  return rate;
}

function validateCurrency(symbol: string, currencies: Currency[] = []): string {
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

type Rates = {
  [currency: string]: number;
};

type OnSuccess = (rates: Rates) => void;

const getCurrencies = debounce(
  100,
  async (
    symbols: string[],
    { signal }: AbortController,
    onSuccess: OnSuccess,
    onError: (err: Error) => void,
    onComplete: () => void,
  ): Promise<void> => {
    try {
      const url = new URL('https://api.exchangeratesapi.io/latest');
      url.search = new URLSearchParams({
        _timestamp: String(Date.now()),
        base: BASE,
        symbols: symbols.join(','),
      }).toString();
      const res = await fetch(url.toString(), { signal });
      const { rates } = await res.json();
      onSuccess(rates);
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    } finally {
      onComplete();
    }
  },
);

type GetRates = (extraSymbol?: string) => void;

function useCurrencyApi(symbols: string[]): [Rates, GetRates, boolean, Error | null] {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortController = useRef<AbortController>();
  const [rates, setRates] = useState<Rates>({});
  const [cacheTime, setCacheTime] = useState<number>(0);

  const onSuccess: OnSuccess = useCallback(
    (newRates) => {
      setRates(
        Object.keys(newRates).reduce(
          (last, symbol) => ({
            ...last,
            [symbol]: 1 / newRates[symbol],
          }),
          rates,
        ),
      );

      setCacheTime(Date.now());
    },
    [rates],
  );

  const onComplete = useCallback(() => {
    setLoading(false);
  }, []);

  const getRates: GetRates = useCallback(
    (extraSymbol?: string) => {
      setError(null);
      const allSymbols: string[] = Array.from(
        new Set(extraSymbol ? [...symbols, extraSymbol] : symbols),
      ).filter((value) => value.length > 0);

      const allCached = allSymbols.every((symbol) => rates[symbol]);
      if (allCached && cacheTime && cacheTime > Date.now() - 3600 * 1000) {
        return;
      }

      abortController.current?.abort();
      const controller = new AbortController();
      abortController.current = controller;
      setLoading(true);

      getCurrencies(allSymbols, controller, onSuccess, setError, onComplete);
    },
    [rates, cacheTime, symbols, onSuccess, onComplete],
  );

  useEffect(
    (): (() => void) => (): void => {
      abortController.current?.abort();
    },
    [],
  );

  return [rates, getRates, loading, error];
}

function useRateRefresh(
  rates: Rates,
  getRates: GetRates,
  loading: boolean,
  symbol: string,
  setRate: (rate: number) => void,
): [React.ReactElement, boolean] {
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

  const button = useMemo<React.ReactElement>(
    () => (
      <ButtonRefresh disabled={loading} onClick={initRefresh}>
        &#8635;
      </ButtonRefresh>
    ),
    [loading, initRefresh],
  );

  return [button, readyToInsert];
}

type PropsEditCurrency = {
  entry: Currency;
  onChange: (entry: Currency) => void;
  onRemove: (currency: string) => void;
  rates: Rates;
  getRates: GetRates;
  loadingRates: boolean;
};

const EditCurrency: React.FC<PropsEditCurrency> = ({
  entry,
  onChange,
  onRemove,
  rates,
  getRates,
  loadingRates,
}) => {
  const [tempRate, setTempRate] = useState<number>(entry.rate);
  const [error, setError] = useState<Error>();

  const [refreshButton, refreshing] = useRateRefresh(
    rates,
    getRates,
    loadingRates,
    entry.currency,
    setTempRate,
  );

  useEffect(() => {
    if (tempRate !== entry.rate) {
      try {
        const rate = validateRate(tempRate || 0);

        setError(undefined);
        onChange({ ...entry, rate });
      } catch (err) {
        setError(err.message);
      }
    }
  }, [tempRate, entry, onChange]);

  const onRemoveCallback = useCallback(() => {
    onRemove(entry.currency);
  }, [onRemove, entry.currency]);

  return (
    <Styled.EditCurrency>
      <Styled.CurrencyTitle>{entry.currency}</Styled.CurrencyTitle>
      <Styled.CurrencyInputGroup>
        <FormFieldNumber
          value={tempRate}
          onChange={setTempRate}
          inputProps={{
            disabled: refreshing,
          }}
        />
        {error && <Styled.RequestError>{error}</Styled.RequestError>}
      </Styled.CurrencyInputGroup>
      {refreshButton}
      <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>
    </Styled.EditCurrency>
  );
};

type PropsAddCurrency = Pick<PropsEditCurrency, 'rates' | 'getRates' | 'loadingRates'> & {
  currencies: Currency[];
  onAdd: (currency: Omit<Currency, 'id'>) => void;
};

const AddCurrency: React.FC<PropsAddCurrency> = ({
  currencies,
  onAdd,
  rates,
  getRates,
  loadingRates,
}) => {
  const [tempCurrency, setTempCurrency] = useState<string>('USD');
  const [tempRate, setTempRate] = useState<number>(0);

  const [refreshButton, refreshing] = useRateRefresh(
    rates,
    getRates,
    loadingRates,
    tempCurrency || '',
    setTempRate,
  );

  const [error, setError] = useState<Error>();

  const onAddCallback = useCallback(() => {
    try {
      const currency = validateCurrency(tempCurrency || '', currencies);
      const rate = validateRate(tempRate);

      setError(undefined);
      onAdd({ currency, rate });
    } catch (err) {
      setError(err.message);
    }
  }, [currencies, onAdd, tempCurrency, tempRate]);

  return (
    <>
      <Styled.CurrencyTitle>{'Add a currency'}</Styled.CurrencyTitle>
      <Styled.AddCurrency>
        <Styled.FormSection>
          <Styled.CurrencyTitle as="span">
            <FormFieldText value={tempCurrency} onChange={setTempCurrency} />
          </Styled.CurrencyTitle>
          <Styled.CurrencyInputGroup>
            <FormFieldNumber
              value={tempRate}
              onChange={setTempRate}
              inputProps={{ disabled: refreshing }}
            />
            {error && <Styled.RequestError>{error}</Styled.RequestError>}
          </Styled.CurrencyInputGroup>
          {refreshButton}
          <ButtonAdd onClick={onAddCallback}>+</ButtonAdd>
        </Styled.FormSection>
      </Styled.AddCurrency>
    </>
  );
};

type Props = {
  containerProps: Omit<ContainerProps, 'step'>;
  item: Create<Entry>;
  onEdit: (item: Create<Entry>) => void;
};

export const StepCurrencies: React.FC<Props> = ({ containerProps, item, onEdit }) => {
  const onAddValue = useCallback(
    (entry: Currency) => {
      const newCurrencies = [...item.currencies, entry];
      onEdit({ ...item, currencies: newCurrencies });
    },
    [onEdit, item],
  );

  const onChangeValue = useCallback(
    (entry: Currency) => {
      const index = item.currencies.findIndex((compare) => compare.currency === entry.currency);
      const newCurrencies = replaceAtIndex(item.currencies, index, entry);
      onEdit({ ...item, currencies: newCurrencies });
    },
    [onEdit, item],
  );

  const onRemoveValue = useCallback(
    (currency: string) => {
      const newCurrencies = item.currencies.filter((compare) => compare.currency !== currency);
      onEdit({ ...item, currencies: newCurrencies });
    },
    [onEdit, item],
  );

  const symbols = item.currencies.map(({ currency }) => currency);
  const [rates, getRates, loadingRates, errorRates] = useCurrencyApi(symbols);

  return (
    <FormContainer {...containerProps} step={Step.Currencies}>
      <Styled.SectionTitle>
        {'Currencies - '}
        {format(item.date, 'yyyy-MM-dd')}
      </Styled.SectionTitle>
      {errorRates && (
        <Styled.RequestError>
          {'Error loading rates: '}
          {errorRates.message}
        </Styled.RequestError>
      )}
      <Styled.CurrencyForm>
        {item.currencies.map((currency) => (
          <EditCurrency
            key={currency.currency}
            entry={currency}
            onChange={onChangeValue}
            onRemove={onRemoveValue}
            rates={rates}
            getRates={getRates}
            loadingRates={loadingRates}
          />
        ))}
        <AddCurrency
          key={0}
          currencies={item.currencies}
          onAdd={onAddValue}
          rates={rates}
          getRates={getRates}
          loadingRates={loadingRates}
        />
      </Styled.CurrencyForm>
    </FormContainer>
  );
};