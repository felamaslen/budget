import { AxiosInstance, AxiosResponse } from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { replaceAtIndex } from 'replace-array';
import * as Styled from './styles';
import { listItemCreated } from '~client/actions';
import {
  FormFieldText,
  FormFieldDate,
  FormFieldDateInline,
  FormFieldCost,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/form-field';
import { ModalWindow } from '~client/components/modal-window';
import { API_PREFIX } from '~client/constants/data';
import { useCancellableRequest, useIsMobile } from '~client/hooks';
import { formatCurrency } from '~client/modules/format';
import {
  Flex,
  Button,
  ButtonDelete,
  ButtonAdd,
  FlexCenter,
  FlexColumn,
} from '~client/styled/shared';
import {
  Food,
  General,
  Social,
  Page,
  PageListCalcCategory,
  Delta,
  ReceiptCategory,
} from '~client/types';

export type Props = {
  setAddingReceipt: (enabled: boolean) => void;
};

type Entry = Omit<Food | General | Social, 'date' | 'shop'> & { page: PageListCalcCategory };

const pageOptions: SelectOptions<PageListCalcCategory> = [
  {
    internal: Page.food,
    external: 'Food',
  },
  {
    internal: Page.general,
    external: 'General',
  },
  {
    internal: Page.social,
    external: 'Social',
  },
];

type EntryProps = {
  entry: Entry;
  loading: boolean;
  isOnly: boolean;
  onChange: (id: number, delta: Delta<Entry>) => void;
  onRemove: (id: number) => void;
};

const inputPropsItem = { placeholder: 'Item' };
const inputPropsCategory = { placeholder: 'Category', tabIndex: -1 };
const inputPropsPage = { tabIndex: -1 };

const requestCategoryPage = (
  axios: AxiosInstance,
  query: string,
): Promise<AxiosResponse<ReceiptCategory[]>> =>
  axios.get<ReceiptCategory[]>(`${API_PREFIX}/data/search/receipt/items?q=${query}`);

function useAutocompleteCategoryPage(
  entries: Entry[],
  setEntries: (action: React.SetStateAction<Entry[]>) => void,
): [boolean, () => void] {
  const [query, setQuery] = useState<string | null>(null);

  const requestItemInfo = useCallback(() => {
    setQuery(entries.length ? entries.map((entry) => entry.item).join(',') : null);
  }, [entries]);

  const handleResponse = useCallback(
    (res: ReceiptCategory[]) => {
      if (!res.length) {
        return;
      }
      setEntries((last) =>
        last.map((entry) => {
          const matchingResponse = res.find(({ item }) => item === entry.item);
          return matchingResponse
            ? { ...entry, category: matchingResponse.category, page: matchingResponse.page }
            : entry;
        }),
      );
    },
    [setEntries],
  );

  const loading = useCancellableRequest<string | null, ReceiptCategory[], string>({
    query,
    sendRequest: requestCategoryPage,
    handleResponse,
  });

  return [loading, requestItemInfo];
}

type ItemResponse = { result: string | null };

const requestItem = (axios: AxiosInstance, query: string): Promise<AxiosResponse<ItemResponse>> =>
  axios.get<ItemResponse>(`${API_PREFIX}/data/search/receipt/item-name?q=${query}`);

function useAutocompleteItem(
  setItemSuggestion: (item: string | null) => void,
): [boolean, string | null, (item: string) => void] {
  const [query, setQuery] = useState<string | null>(null);

  const handleResponse = useCallback(
    ({ result }: ItemResponse) => {
      setItemSuggestion(result);
    },
    [setItemSuggestion],
  );

  const onClear = useCallback(() => {
    setItemSuggestion(null);
    setQuery(null);
  }, [setItemSuggestion]);

  const loading = useCancellableRequest<string | null, ItemResponse, string>({
    query,
    sendRequest: requestItem,
    handleResponse,
    onClear,
  });

  return [loading, query, setQuery];
}

type PropsItem = {
  onChange: (item: string) => void;
  suggestion: string | null;
  setSuggestion: (suggestion: React.SetStateAction<string | null>) => void;
} & Pick<Entry, 'item'>;

const EntryFormItemField: React.FC<PropsItem> = ({ item, onChange, suggestion, setSuggestion }) => {
  const [accepted, setAccepted] = useState<boolean>(false);
  const didAccept = useRef<boolean>();

  const [, query, requestItemSuggestion] = useAutocompleteItem(setSuggestion);

  const hasSuggestion = !!suggestion;
  useEffect(() => {
    if (hasSuggestion) {
      const listener = (event: KeyboardEvent): void => {
        if (event.key === 'ArrowRight') {
          didAccept.current = false;
          setAccepted(true);
        }
      };
      window.addEventListener('keydown', listener);
      return (): void => {
        window.removeEventListener('keydown', listener);
      };
    }

    return (): void => {
      // pass
    };
  }, [hasSuggestion]);

  const validSuggestion =
    !!suggestion && !!query && suggestion.toLowerCase().startsWith(query.toLowerCase());

  useEffect(() => {
    didAccept.current = false;
    if (query && suggestion && validSuggestion) {
      onChange(suggestion.substring(0, query.length));
    }
  }, [suggestion, validSuggestion, query, onChange]);

  useEffect(() => {
    if (accepted && !didAccept.current && suggestion) {
      didAccept.current = true;
      setAccepted(false);
      onChange(suggestion);
    }
  }, [accepted, onChange, suggestion]);

  const onBlur = useCallback(() => {
    setSuggestion(null);
  }, [setSuggestion]);

  const onTouchStart = useCallback(() => {
    if (validSuggestion && suggestion) {
      onChange(suggestion);
    }
  }, [validSuggestion, suggestion, onChange]);

  return (
    <Styled.ItemField>
      <FormFieldText
        value={item}
        onChange={onChange}
        onType={requestItemSuggestion}
        inputProps={{ ...inputPropsItem, onBlur, onTouchStart }}
      />
      {validSuggestion && <Styled.ItemSuggestion>{suggestion}</Styled.ItemSuggestion>}
    </Styled.ItemField>
  );
};

const EntryForm: React.FC<EntryProps> = ({ entry, loading, isOnly, onChange, onRemove }) => {
  const { id } = entry;

  const onChangeCategory = useCallback((category: string) => onChange(id, { category }), [
    id,
    onChange,
  ]);
  const onChangeCost = useCallback((cost: number) => onChange(id, { cost }), [id, onChange]);
  const onChangePage = useCallback((page: PageListCalcCategory) => onChange(id, { page }), [
    id,
    onChange,
  ]);

  const onChangeItem = useCallback((item: string) => onChange(id, { item }), [id, onChange]);
  const [itemSuggestion, setItemSuggestion] = useState<string | null>(null);

  return (
    <FlexCenter>
      <Styled.ItemCategory>
        <Styled.ItemField>
          <EntryFormItemField
            onChange={onChangeItem}
            item={entry.item}
            suggestion={itemSuggestion}
            setSuggestion={setItemSuggestion}
          />
        </Styled.ItemField>
        <Styled.CategoryField>
          <FormFieldText
            value={entry.category}
            onChange={onChangeCategory}
            inputProps={{ ...inputPropsCategory, disabled: loading }}
          />
        </Styled.CategoryField>
      </Styled.ItemCategory>
      <Styled.CostPage>
        <FormFieldCost value={entry.cost} onChange={onChangeCost} />
        <FormFieldSelect
          options={pageOptions}
          value={entry.page}
          onChange={onChangePage}
          inputProps={{ ...inputPropsPage, disabled: loading }}
        />
      </Styled.CostPage>
      <FlexColumn>
        <ButtonDelete onClick={(): void => onRemove(entry.id)} disabled={isOnly}>
          &minus;
        </ButtonDelete>
      </FlexColumn>
    </FlexCenter>
  );
};

const defaultEntry: Entry = {
  id: 0,
  item: '',
  category: '',
  cost: 0,
  page: Page.food,
};

export const AddReceipt: React.FC<Props> = ({ setAddingReceipt }) => {
  const isMobile = useIsMobile();

  const onClosed = useCallback(() => setAddingReceipt(false), [setAddingReceipt]);

  const dispatch = useDispatch();

  const [date, setDate] = useState<Date>(new Date());
  const onChangeDate = useCallback((value?: Date) => setDate((last) => value ?? last), []);
  const [shop, setShop] = useState<string>('');

  const [entries, setEntries] = useState<Entry[]>([defaultEntry]);

  const createNewEntry = useCallback(() => {
    setEntries((last) => [
      ...last,
      {
        id: last.reduce<number>((accum, entry) => Math.max(accum, entry.id + 1), 0),
        item: '',
        category: '',
        cost: 0,
        page: Page.food,
      },
    ]);
  }, []);

  const onChange = useCallback((id: number, delta: Delta<Entry>) => {
    setEntries((last) =>
      replaceAtIndex(
        last,
        last.findIndex((entry) => entry.id === id),
        (entry) => ({ ...entry, ...delta }),
      ),
    );
  }, []);

  const onRemove = useCallback((id: number) => {
    setEntries((last) => {
      const removed = last.filter((entry) => entry.id !== id);
      return removed.length ? removed : last;
    });
  }, []);

  const [loading, requestItemInfo] = useAutocompleteCategoryPage(entries, setEntries);

  const canRequestFinish = !loading && !!shop.length;
  const isValid =
    canRequestFinish && entries.every((entry) => !!(entry.item && entry.category && entry.cost));

  const [finished, setFinished] = useState<boolean>(false);
  const [focusReset, resetFocus] = useState<boolean>(false);
  const onFinish = useCallback(() => {
    if (canRequestFinish) {
      setFinished(true);
    }
  }, [canRequestFinish]);

  useEffect(() => {
    if (finished) {
      setFinished(false);
      if (isValid) {
        entries.forEach((entry) => {
          dispatch(
            listItemCreated(entry.page)({
              date,
              item: entry.item,
              category: entry.category,
              cost: entry.cost,
              shop,
            }),
          );
        });
        setEntries([defaultEntry]);
        setImmediate(() => {
          resetFocus(true);
        });
      } else {
        requestItemInfo();
      }
    }
  }, [dispatch, date, shop, entries, finished, isValid, requestItemInfo]);

  const onBlurDate = useCallback(() => {
    resetFocus(false);
  }, []);

  const total = entries.reduce<number>((last, { cost }) => last + cost, 0);

  return (
    <ModalWindow title="Add receipt" onClosed={onClosed} width={300}>
      <Styled.Main>
        <FlexColumn>
          <Flex>
            <label htmlFor="receipt-date">
              <Styled.Label>Date</Styled.Label>
              {isMobile ? (
                <FormFieldDate id="receipt-date" value={date} onChange={onChangeDate} />
              ) : (
                <FormFieldDateInline
                  id="receipt-date"
                  value={date}
                  onChange={onChangeDate}
                  active={focusReset}
                  inputProps={{ onBlur: onBlurDate }}
                />
              )}
            </label>
          </Flex>
          <Flex>
            <label htmlFor="receipt-shop">
              <Styled.Label>Shop</Styled.Label>
              <FormFieldText id="receipt-shop" value={shop} onChange={setShop} />
            </label>
          </Flex>
        </FlexColumn>
        <Styled.List>
          {entries.map((entry) => (
            <EntryForm
              key={entry.id}
              entry={entry}
              loading={loading}
              isOnly={entries.length === 1}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
          <Styled.CreateRow>
            <ButtonAdd onClick={createNewEntry}>+</ButtonAdd>
          </Styled.CreateRow>
        </Styled.List>
        <Flex>
          <Button onClick={onFinish} disabled={!canRequestFinish}>
            {isValid ? 'Finish' : 'Autocomplete'}
          </Button>
          <Styled.TotalCost>Total: {formatCurrency(total)}</Styled.TotalCost>
        </Flex>
      </Styled.Main>
    </ModalWindow>
  );
};
