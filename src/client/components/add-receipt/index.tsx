import { useEffect, useState, useCallback, useRef } from 'react';
import { replaceAtIndex } from 'replace-array';
import * as Styled from './styles';
import {
  FormFieldTextInline,
  FormFieldDate,
  FormFieldDateInline,
  FormFieldCost,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/form-field';
import { ModalWindow } from '~client/components/modal-window';
import { useFetchingState, useIsMobile } from '~client/hooks';
import {
  useCreateReceiptMutation,
  useReceiptItemQuery,
  useReceiptItemsQuery,
} from '~client/hooks/gql';
import { formatCurrency, toISO } from '~client/modules/format';
import {
  Flex,
  Button,
  ButtonDelete,
  ButtonAdd,
  FlexCenter,
  FlexColumn,
} from '~client/styled/shared';
import type { Delta } from '~client/types';
import { ReceiptPage } from '~client/types/enum';
import type { ListItemStandard, ReceiptInput } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type Props = {
  setAddingReceipt: (enabled: boolean) => void;
};

type Entry = Omit<GQL<ListItemStandard>, 'date' | 'shop'> & { page: ReceiptPage };

type EntryErrors = Partial<Record<Exclude<keyof Entry, 'id' | 'page'>, boolean>>;

const pageOptions: SelectOptions<ReceiptPage> = [
  { internal: ReceiptPage.Food, external: 'Food' },
  { internal: ReceiptPage.General, external: 'General' },
  { internal: ReceiptPage.Social, external: 'Social' },
];

type EntryProps = {
  entry: Entry;
  errors?: EntryErrors;
  loading: boolean;
  isOnly: boolean;
  onChange: (id: number, delta: Delta<Entry>) => void;
  onRemove: (id: number) => void;
  focus: Focus | null;
  setFocus: React.Dispatch<React.SetStateAction<Focus | null>>;
};

enum Focus {
  date = 'date',
  newItem = 'newItem',
}

const inputPropsItem = { placeholder: 'Item' };
const inputPropsCategory = { placeholder: 'Category' };

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
  setItemSuggestion: React.Dispatch<React.SetStateAction<string | null>>,
): [boolean, string | null, (item: string | undefined) => void] {
  const [query, setQuery] = useState<string | null | undefined>(null);

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

  return [fetching, query ?? null, setQuery];
}

type PropsItem = {
  error?: boolean;
  onChange: (item: string | undefined) => void;
  suggestion: string | null;
  setSuggestion: React.Dispatch<React.SetStateAction<string | null>>;
} & Pick<Entry, 'item'> &
  Pick<EntryProps, 'focus' | 'setFocus'>;

const EntryFormItemField: React.FC<PropsItem> = ({
  item,
  error,
  onChange,
  suggestion,
  setSuggestion,
  focus,
  setFocus,
}) => {
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
    setFocus(null);
  }, [setSuggestion, setFocus]);

  const onTouchStart = useCallback(() => {
    if (validSuggestion && suggestion) {
      onChange(suggestion);
    }
  }, [validSuggestion, suggestion, onChange]);

  return (
    <Styled.ItemField error={error}>
      <FormFieldTextInline
        value={item}
        onChange={onChange}
        onType={requestItemSuggestion}
        active={focus === Focus.newItem}
        inputProps={{ ...inputPropsItem, onBlur, onTouchStart }}
      />
      {validSuggestion && <Styled.ItemSuggestion>{suggestion}</Styled.ItemSuggestion>}
    </Styled.ItemField>
  );
};

const EntryForm: React.FC<EntryProps> = ({
  entry,
  errors,
  loading,
  isOnly,
  onChange,
  onRemove,
  focus,
  setFocus,
}) => {
  const { id } = entry;

  const onChangeCategory = useCallback(
    (category: string | undefined) => onChange(id, { category }),
    [id, onChange],
  );
  const onChangeCost = useCallback((cost: number) => onChange(id, { cost }), [id, onChange]);
  const onChangePage = useCallback((page: ReceiptPage) => onChange(id, { page }), [id, onChange]);

  const onChangeItem = useCallback(
    (item: string | undefined) => onChange(id, { item }),
    [id, onChange],
  );
  const [itemSuggestion, setItemSuggestion] = useState<string | null>(null);

  return (
    <FlexCenter>
      <Styled.ItemCategory>
        <EntryFormItemField
          error={errors?.item}
          onChange={onChangeItem}
          item={entry.item}
          suggestion={itemSuggestion}
          setSuggestion={setItemSuggestion}
          focus={focus}
          setFocus={setFocus}
        />
        <Styled.CategoryField error={errors?.category}>
          <FormFieldTextInline
            value={entry.category}
            onChange={onChangeCategory}
            inputProps={{ ...inputPropsCategory, disabled: loading }}
          />
        </Styled.CategoryField>
      </Styled.ItemCategory>
      <Styled.CostPage>
        <Styled.CostPageField error={errors?.cost}>
          <FormFieldCost value={entry.cost} onChange={onChangeCost} />
        </Styled.CostPageField>
        <Styled.CostPageField>
          <FormFieldSelect
            options={pageOptions}
            value={entry.page}
            onChange={onChangePage}
            inputProps={{ disabled: loading }}
          />
        </Styled.CostPageField>
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

  const [focus, setFocus] = useState<Focus | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const onChangeDate = useCallback((value?: Date) => setDate((last) => value ?? last), []);
  const [shop, setShop] = useState<string | undefined>('');

  const [entries, setEntries] = useState<Entry[]>([defaultEntry]);

  const createNewEntry = useCallback(() => {
    setEntries((last) => {
      const nextId = last.reduce<number>((accum, entry) => Math.max(accum, entry.id + 1), 0);
      return [
        ...last,
        {
          id: nextId,
          item: '',
          category: '',
          cost: 0,
          page: ReceiptPage.Food,
        },
      ];
    });
    setTimeout(() => {
      setFocus(Focus.newItem);
    }, 0);
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

  const canRequestFinish = !loading && !!shop?.length;
  const isValid =
    canRequestFinish && entries.every((entry) => !!(entry.item && entry.category && entry.cost));

  const errors = entries.reduce<Record<number, EntryErrors>>(
    (last, { id, item, category, cost }) => ({
      ...last,
      [id]: {
        item: !item,
        category: !category,
        cost: !cost,
      },
    }),
    {},
  );

  const [finished, setFinished] = useState<boolean>(false);
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
          shop: shop ?? '',
          items: entries.map<ReceiptInput>((entry) => ({
            page: entry.page,
            item: entry.item,
            category: entry.category,
            cost: entry.cost,
          })),
        });
        setEntries([defaultEntry]);
        setTimeout(() => {
          setFocus(Focus.date);
        }, 0);
      } else {
        requestItemInfo();
      }
    }
  }, [date, shop, entries, finished, isValid, requestItemInfo, mutateCreateReceipt]);

  const onBlurDate = useCallback(() => {
    setFocus(null);
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
                  active={focus === Focus.date}
                  inputProps={{ onBlur: onBlurDate }}
                />
              )}
            </label>
          </Flex>
          <Flex>
            <label htmlFor="receipt-shop">
              <Styled.Label>Shop</Styled.Label>
              <Styled.Field error={!shop}>
                <FormFieldTextInline id="receipt-shop" value={shop} onChange={setShop} />
              </Styled.Field>
            </label>
          </Flex>
        </FlexColumn>
        <Styled.List>
          {entries.map((entry, index) => (
            <EntryForm
              key={entry.id}
              errors={errors[entry.id]}
              entry={entry}
              loading={loading}
              isOnly={entries.length === 1}
              onChange={onChange}
              onRemove={onRemove}
              focus={index === entries.length - 1 ? focus : null}
              setFocus={setFocus}
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
