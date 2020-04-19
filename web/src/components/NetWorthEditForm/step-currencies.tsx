import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import format from 'date-fns/format';
import axios, { CancelTokenSource } from 'axios';
import { debounce } from 'throttle-debounce';
import shortid from 'shortid';
import { replaceAtIndex } from 'replace-array';

import { CreateEdit } from '~client/types/crud';
import { Entry, Currency } from '~client/types/net-worth';
import { ButtonDelete, ButtonAdd, ButtonRefresh } from '~client/styled/shared/button';
import FormFieldText from '~client/components/FormField';
import FormFieldNumber from '~client/components/FormField/number';
import FormContainer, { Props as ContainerProps } from './form-container';

import { Step } from './constants';
import * as Styled from './styles';

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
    source: React.MutableRefObject<CancelTokenSource | undefined>,
    onSuccess: OnSuccess,
    onError: (err: Error) => void,
    onComplete: () => void,
  ): Promise<void> => {
    try {
      const res = await axios.get<Rates>('https://api.exchangeratesapi.io/latest', {
        params: {
          base: BASE,
          symbols: symbols.join(','),
        },
        cancelToken: (source.current && source.current.token) || undefined,
      });

      onSuccess(res.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        onError(err);
      }
    } finally {
      onComplete();
    }
  },
);

type GetRates = (extraSymbol?: string) => void;

function useCurrencyApi(symbols: string[]): [Rates, GetRates, boolean, Error | undefined] {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const source = useRef<CancelTokenSource>();
  const [rates, setRates] = useState<Rates>({});
  const [cacheTime, setCacheTime] = useState<number>(0);

  const onSuccess: OnSuccess = useCallback(
    newRates => {
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
      const allSymbols: string[] = Array.from(
        new Set(extraSymbol ? [...symbols, extraSymbol] : symbols),
      ).filter(value => value.length > 0);

      const allCached = allSymbols.every(symbol => rates[symbol]);
      if (allCached && cacheTime && cacheTime > Date.now() - 3600 * 1000) {
        return;
      }

      if (source.current) {
        source.current.cancel('New request made');
      }
      source.current = axios.CancelToken.source();
      setLoading(true);

      getCurrencies(allSymbols, source, onSuccess, setError, onComplete);
    },
    [rates, cacheTime, symbols, onSuccess, onComplete],
  );

  useEffect(
    (): (() => void) => (): void => {
      if (source.current) {
        source.current.cancel('Component unmounted');
      }
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
  onRemove: (id: string) => void;
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
  const [tempRate, setTempRate] = useState<number | undefined>(entry.rate);
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
    onRemove(entry.id);
  }, [onRemove, entry.id]);

  return (
    <Styled.EditCurrency>
      <Styled.CurrencyTitle>{entry.currency}</Styled.CurrencyTitle>
      <Styled.CurrencyInputGroup>
        <FormFieldNumber value={tempRate} onChange={setTempRate} disabled={refreshing} />
        {error && <Styled.Error>{error}</Styled.Error>}
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
  const [tempCurrency, setTempCurrency] = useState<string | undefined>('USD');
  const [tempRate, setTempRate] = useState<number | undefined>(0);

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
      const rate = validateRate(tempRate || 0);

      setError(undefined);
      onAdd({ currency, rate });
    } catch (err) {
      setError(err.message);
    }
  }, [currencies, onAdd, tempCurrency, tempRate]);

  return (
    <Styled.AddCurrency>
      <Styled.CurrencyTitle>{'Add a currency'}</Styled.CurrencyTitle>
      <Styled.FormSection>
        <FormFieldText value={tempCurrency} onChange={setTempCurrency} />
        <Styled.CurrencyInputGroup>
          <FormFieldNumber value={tempRate} onChange={setTempRate} disabled={refreshing} />
          {error && <Styled.Error>{error}</Styled.Error>}
        </Styled.CurrencyInputGroup>
        {refreshButton}
        <ButtonAdd onClick={onAddCallback}>+</ButtonAdd>
      </Styled.FormSection>
    </Styled.AddCurrency>
  );
};

type Props = {
  containerProps: ContainerProps;
  item: CreateEdit<Entry>;
  onEdit: (item: CreateEdit<Entry>) => void;
};

const StepCurrencies: React.FC<Props> = ({ containerProps, item, onEdit }) => {
  const onAddValue = useCallback(
    currency => {
      const newCurrencies = item.currencies.concat([
        {
          id: shortid.generate(),
          ...currency,
        },
      ]);
      onEdit({ ...item, currencies: newCurrencies });
    },
    [onEdit, item],
  );

  const onChangeValue = useCallback(
    currency => {
      const index = item.currencies.findIndex(({ id }: Currency): boolean => id === currency.id);
      const newCurrencies = replaceAtIndex(item.currencies, index, currency);
      onEdit({ ...item, currencies: newCurrencies });
    },
    [onEdit, item],
  );

  const onRemoveValue = useCallback(
    id => {
      const newCurrencies = item.currencies.filter(
        ({ id: currencyId }: Currency): boolean => currencyId !== id,
      );
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
        <Styled.Error>
          {'Error loading rates: '}
          {errorRates.message}
        </Styled.Error>
      )}
      <div>
        {item.currencies.map(currency => (
          <EditCurrency
            key={currency.id}
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
      </div>
    </FormContainer>
  );
};

export default StepCurrencies;
