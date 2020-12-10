import { useCallback, useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { FieldKey, ActiveField, ADD_BUTTON } from './types';
import { isSearchPage } from '~client/constants/data';
import { isEscape } from '~client/modules/nav';
import {
  ListItemInput,
  PageList,
  QuerySearchArgs,
  SearchItem,
  useSearchSuggestionsQuery,
} from '~client/types';

const searchItems: SearchItem[] = Object.values(SearchItem);

const isSearchItem = <I extends ListItemInput>(
  field: FieldKey<I> | SearchItem,
): field is SearchItem => (searchItems as string[]).includes(field as string);

type Options<I extends ListItemInput, P extends string> = {
  suggestionFields: FieldKey<I>[];
  fields: FieldKey<I>[];
  page: P;
  setDelta: React.Dispatch<React.SetStateAction<Partial<I>>>;
};

export type Result<I extends ListItemInput> = {
  onType: (field: FieldKey<I>, value: string) => void;
  list: string[];
  next: string[];
  activateSuggestion: (index: number) => void;
  activeField: ActiveField<I>;
  setActiveField: (field: FieldKey<I>) => void;
};

const sanitizeValue = (value: string): string =>
  value.replace(/[^A-Za-z\s]+/g, '').replace(/\s+/g, ' ');

const numToRequest = 5;

type State<I extends ListItemInput> = {
  list: string[];
  next: string[];
  nextField: ActiveField<I>;
  activeField: ActiveField<I>;
  requestedField: FieldKey<I> | null;
};

const stateEmpty = { list: [], next: [], nextField: null, requestedField: null };

type SuggestionRequest = {
  column: SearchItem;
  searchTerm: string;
};

export function useSuggestions<I extends ListItemInput, P extends PageList>({
  suggestionFields,
  fields,
  page,
  setDelta,
}: Options<I, P>): Result<I> {
  const [state, setState] = useState<State<I>>({
    list: [],
    next: [],
    nextField: null,
    activeField: null,
    requestedField: null,
  });

  const [suggestionRequest, setSuggestionRequest] = useState<SuggestionRequest | undefined>();
  const [debouncedRequest] = useDebounce(suggestionRequest, 100);

  const [{ data, fetching, stale }] = useSearchSuggestionsQuery({
    pause: !(isSearchPage(page) && debouncedRequest),
    variables:
      isSearchPage(page) && debouncedRequest
        ? {
            page,
            column: debouncedRequest.column,
            searchTerm: debouncedRequest.searchTerm,
            numResults: numToRequest,
          }
        : ({} as QuerySearchArgs),
  });

  useEffect(() => {
    if (data?.search && suggestionRequest && !fetching && !stale) {
      const list = data.search.list ?? [];
      const next = data.search.nextCategory ?? [];
      const nextField = data.search.nextField ?? null;

      setState((last) =>
        last.activeField === suggestionRequest.column
          ? {
              ...last,
              list,
              next,
              nextField: nextField as FieldKey<I>,
              requestedField: suggestionRequest.column as FieldKey<I>,
            }
          : last,
      );
    }
  }, [data, fetching, stale, suggestionRequest]);

  const onType = useCallback(
    (field: FieldKey<I>, value: string): void => {
      const enabled = suggestionFields.includes(field);
      if (!(enabled && isSearchItem(field))) {
        return;
      }
      setState((last) =>
        last.activeField === field ? last : { ...last, activeField: field, ...stateEmpty },
      );
      if (value) {
        setSuggestionRequest({ column: field, searchTerm: sanitizeValue(value) });
      } else {
        setState((last) => ({ ...last, ...stateEmpty }));
      }
    },
    [suggestionFields],
  );

  useEffect(() => {
    if (state.requestedField && state.activeField !== state.requestedField) {
      setState((last) => ({
        ...last,
        list: [],
        next: [],
        nextField: null,
        requestedField: null,
      }));
    }
  }, [state.activeField, state.requestedField]);

  const naturalNextField = useMemo<State<I>['nextField']>(() => {
    if (!state.activeField || state.activeField === ADD_BUTTON) {
      return null;
    }
    const fieldIndex = fields.indexOf(state.activeField);
    return fieldIndex === fields.length - 1 ? ADD_BUTTON : fields[fieldIndex + 1];
  }, [fields, state.activeField]);

  const activateSuggestion = useCallback(
    (index: number): void => {
      if (index < 0 || index > state.list.length - 1 || !state.activeField) {
        return;
      }

      const nextValue = state.next[index] ?? null;
      const nextField = state.nextField ?? naturalNextField;

      setDelta(
        (last: Partial<I>): Partial<I> => {
          const withMain: Partial<I> = {
            ...last,
            [state.activeField ?? '']: state.list[index],
          };

          return nextValue && nextField ? { ...withMain, [nextField]: nextValue } : withMain;
        },
      );
      setImmediate(() => {
        setState((last) => ({
          ...last,
          activeField: nextField === ADD_BUTTON ? ADD_BUTTON : null,
          list: [],
          next: [],
        }));
        if (nextField !== ADD_BUTTON) {
          setImmediate(() => {
            setState((last) => ({
              ...last,
              activeField: nextField,
              nextField: null,
            }));
          });
        }
      });
    },
    [state.list, state.next, state.nextField, naturalNextField, state.activeField, setDelta],
  );

  const setActiveField = useCallback(
    (field: FieldKey<I>): void => setState((last) => ({ ...last, activeField: field })),
    [],
  );

  const firstField = fields[0];
  useEffect(() => {
    const listener = (event: KeyboardEvent): void => {
      if (isEscape(event)) {
        event.stopPropagation();
        setState((last) => ({
          ...last,
          activeField: last.activeField === firstField ? null : firstField,
        }));
      }
    };

    window.addEventListener('keydown', listener);
    return (): void => window.removeEventListener('keydown', listener);
  }, [firstField]);

  return {
    onType,
    list: state.list,
    next: state.next,
    activateSuggestion,
    activeField: state.activeField,
    setActiveField,
  };
}
