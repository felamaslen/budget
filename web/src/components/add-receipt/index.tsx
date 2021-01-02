import React, { useEffect, useState, useCallback, useRef } from 'react';
import { replaceAtIndex } from 'replace-array';
import * as Styled from './styles';
import {
  FormFieldText,
  FormFieldDate,
  FormFieldDateInline,
  FormFieldCost,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/form-field';
import { ModalWindow } from '~client/components/modal-window';
import { useFetchingState, useIsMobile } from '~client/hooks';
import { formatCurrency, toISO } from '~client/modules/format';
import {
  Flex,
  Button,
  ButtonDelete,
  ButtonAdd,
  FlexCenter,
  FlexColumn,
} from '~client/styled/shared';
import {
  Delta,
  GQL,
  ListItemExtended,
  ReceiptInput,
  ReceiptPage,
  useCreateReceiptMutation,
  useReceiptItemQuery,
  useReceiptItemsQuery,
} from '~client/types';

export type Props = {
  setAddingReceipt: (enabled: boolean) => void;
};

type Entry = Omit<GQL<ListItemExtended>, 'date' | 'shop'> & { page: ReceiptPage };

const pageOptions: SelectOptions<ReceiptPage> = [
  { internal: ReceiptPage.Food, external: 'Food' },
  { internal: ReceiptPage.General, external: 'General' },
  { internal: ReceiptPage.Social, external: 'Social' },
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

function useAutocompleteCategoryPage(
  entries: Entry[],
  setEntries: (action: React.SetStateAction<Entry[]>) => void,
): [boolean, () => void] {
  const [query, setQuery] = useState<string[]>([]);

  const [{ data, stale, fetching }] = useReceiptItemsQuery({
    pause: !query.length,
    variables: {
      items: query,
    },
  });

  const requestItemInfo = useCallback(() => {
    setQuery(entries.map((entry) => entry.item));
  }, [entries]);

  useEffect(() => {
    if (!fetching && !stale && data?.receiptItems?.length) {
      setEntries((last) =>
        last.map<Entry>((entry) => {
          const matchingResponse = data?.receiptItems?.find(({ item }) => item === entry.item);
          return matchingResponse
            ? {
                ...entry,
                category: matchingResponse.category,
                page: matchingResponse.page,
              }
            : entry;
        }),
      );
    }
  }, [fetching, stale, data, setEntries]);

  return [fetching, requestItemInfo];
}

function useAutocompleteItem(
  setItemSuggestion: (item: string | null) => void,
): [boolean, string | null, (item: string) => void] {
  const [query, setQuery] = useState<string | null>(null);

  const [{ data, stale, fetching }] = useReceiptItemQuery({
    pause: !query,
    variables: {
      item: query ?? '',
    },
  });

  useEffect(() => {
    if (!fetching && !stale && data?.receiptItem) {
      setItemSuggestion(data.receiptItem);
    }
  }, [data, stale, fetching, setItemSuggestion]);

  const noQuery = !query;
  useEffect(() => {
    if (noQuery) {
      setItemSuggestion(null);
    }
  }, [noQuery, setItemSuggestion]);

  return [fetching, query, setQuery];
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
  const onChangePage = useCallback((page: ReceiptPage) => onChange(id, { page }), [id, onChange]);

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
  page: ReceiptPage.Food,
};

export const AddReceipt: React.FC<Props> = ({ setAddingReceipt }) => {
  const isMobile = useIsMobile();

  const onClosed = useCallback(() => setAddingReceipt(false), [setAddingReceipt]);

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
        page: ReceiptPage.Food,
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

  const [mutationResult, mutateCreateReceipt] = useCreateReceiptMutation();
  useFetchingState(mutationResult);

  useEffect(() => {
    if (finished) {
      setFinished(false);
      if (isValid) {
        mutateCreateReceipt({
          date: toISO(date),
          shop,
          items: entries.map<ReceiptInput>((entry) => ({
            page: entry.page,
            item: entry.item,
            category: entry.category,
            cost: entry.cost,
          })),
        });
        setEntries([defaultEntry]);
        setImmediate(() => {
          resetFocus(true);
        });
      } else {
        requestItemInfo();
      }
    }
  }, [date, shop, entries, finished, isValid, requestItemInfo, mutateCreateReceipt]);

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
