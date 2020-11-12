import { AxiosInstance, AxiosResponse } from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { replaceAtIndex } from 'replace-array';
import * as Styled from './styles';
import { listItemCreated } from '~client/actions';
import {
  FormFieldText,
  FormFieldDate,
  FormFieldCost,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/form-field';
import { ModalWindow } from '~client/components/modal-window';
import { API_PREFIX } from '~client/constants/data';
import { useCancellableRequest } from '~client/hooks';
import { Flex, Button } from '~client/styled/shared';
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
  onChangeCategory: (category: string) => void,
  onChangePage: (page: PageListCalcCategory) => void,
): [boolean, (item: string) => void] {
  const [query, setQuery] = useState<string | null>(null);

  const handleResponse = useCallback(
    (res: ReceiptCategory[]) => {
      if (!res.length) {
        return;
      }
      onChangeCategory(res[0].category);
      onChangePage(res[0].page);
    },
    [onChangeCategory, onChangePage],
  );

  const loading = useCancellableRequest<string | null, ReceiptCategory[], string>({
    query,
    sendRequest: requestCategoryPage,
    handleResponse,
  });

  return [loading, setQuery];
}

type ItemResponse = { result: string | null };

const requestItem = (axios: AxiosInstance, query: string): Promise<AxiosResponse<ItemResponse>> =>
  axios.get<ItemResponse>(`${API_PREFIX}/data/search/receipt/item-name?q=${query}`);

function useAutocompleteItem(
  setItemSuggestion: (item: string | null) => void,
): [boolean, (item: string) => void] {
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

  return [loading, setQuery];
}

type PropsItem = {
  onChange: (item: string) => void;
} & Pick<Entry, 'item'>;

const EntryFormItemField: React.FC<PropsItem> = ({ item, onChange }) => {
  const [itemSuggestion, setItemSuggestion] = useState<string | null>(null);

  const [accepted, setAccepted] = useState<boolean>(false);
  const didAccept = useRef<boolean>();

  const [, requestItemSuggestion] = useAutocompleteItem(setItemSuggestion);

  const hasSuggestion = !!itemSuggestion;
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

  useEffect(() => {
    didAccept.current = false;
  }, [itemSuggestion]);

  useEffect(() => {
    if (accepted && !didAccept.current && itemSuggestion) {
      didAccept.current = true;
      setAccepted(false);
      onChange(itemSuggestion);
    }
  }, [accepted, onChange, itemSuggestion]);

  return (
    <Styled.ItemField>
      <FormFieldText
        value={item}
        onChange={onChange}
        onType={requestItemSuggestion}
        inputProps={inputPropsItem}
      />
      {itemSuggestion && <Styled.ItemSuggestion>{itemSuggestion}</Styled.ItemSuggestion>}
    </Styled.ItemField>
  );
};

const EntryForm: React.FC<EntryProps> = ({ entry, onChange, onRemove }) => {
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

  const [loading, requestItemInfo] = useAutocompleteCategoryPage(onChangeCategory, onChangePage);
  const onChangeItem = useCallback(
    (item: string) => {
      requestItemInfo(item);
      onChange(id, { item });
    },
    [id, onChange, requestItemInfo],
  );

  return (
    <Flex>
      <EntryFormItemField onChange={onChangeItem} item={entry.item} />
      <FormFieldText
        value={entry.category}
        onChange={onChangeCategory}
        inputProps={{ ...inputPropsCategory, disabled: loading }}
      />
      <FormFieldCost value={entry.cost} onChange={onChangeCost} />
      <FormFieldSelect
        options={pageOptions}
        value={entry.page}
        onChange={onChangePage}
        inputProps={{ ...inputPropsPage, disabled: loading }}
      />
      <Button onClick={(): void => onRemove(entry.id)} tabIndex={-1}>
        &minus;
      </Button>
    </Flex>
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
  const onClosed = useCallback(() => setAddingReceipt(false), [setAddingReceipt]);

  const dispatch = useDispatch();

  const [date, setDate] = useState<Date>(new Date());
  const [shop, setShop] = useState<string>('');

  const [entries, setEntries] = useState<Entry[]>([defaultEntry]);

  const createNewEntry = useCallback(() => {
    setEntries((last) => [
      ...last,
      {
        id: last.length,
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

  const [finished, setFinished] = useState<boolean>(false);
  const onFinish = useCallback(() => {
    setFinished(true);
  }, []);

  useEffect(() => {
    if (finished) {
      setFinished(false);
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
      setShop('');
    }
  }, [dispatch, date, shop, entries, finished]);

  const isValid =
    !!shop.length && entries.every((entry) => !!(entry.item && entry.category && entry.cost));

  return (
    <ModalWindow title="Add receipt" onClosed={onClosed}>
      <Styled.Main>
        <Flex>
          <label htmlFor="receipt-date">
            <Styled.Label>Date</Styled.Label>
            <FormFieldDate id="receipt-date" value={date} onChange={setDate} />
          </label>
        </Flex>
        <Flex>
          <label htmlFor="receipt-shop">
            <Styled.Label>Shop</Styled.Label>
            <FormFieldText id="receipt-shop" value={shop} onChange={setShop} />
          </label>
        </Flex>
        <Styled.List>
          {entries.map((entry) => (
            <EntryForm key={entry.id} entry={entry} onChange={onChange} onRemove={onRemove} />
          ))}
          <Button onClick={createNewEntry}>Add</Button>
        </Styled.List>
        <Button onClick={onFinish} disabled={!isValid}>
          Finish
        </Button>
      </Styled.Main>
    </ModalWindow>
  );
};
