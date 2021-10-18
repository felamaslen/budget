import { useDebounceCallback } from '@react-hook/debounce';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';

import { ADD_BUTTON } from './constants';
import type { FieldKey, ActiveField } from './types';
import { isSearchPage } from '~client/constants/data';
import { useSearchSuggestionsQuery } from '~client/hooks/gql';
import { isEscape } from '~client/modules/nav';
import type { PageList } from '~client/types';
import { SearchItem } from '~client/types/enum';
import type { ListItemInput, QuerySearchArgs, SearchPage } from '~client/types/gql';

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
  clear: () => void;
};

const sanitizeValue = (value: string): string =>
  value.replace(/[^A-Za-z\s]+/g, '').replace(/\s+/g, ' ');

const numToRequest = 5;

type Query = Pick<QuerySearchArgs, 'column' | 'searchTerm'>;

type State<I extends ListItemInput> = {
  query: Query | null;
  list: string[];
  next: string[];
  nextField: ActiveField<I>;
  activeField: ActiveField<I>;
  requestedField: FieldKey<I> | null;
};

export function useSuggestions<I extends ListItemInput, P extends PageList>({
  suggestionFields,
  fields,
  page,
  setDelta,
}: Options<I, P>): Result<I> {
  const [state, setState] = useState<State<I>>({
    query: null,
    list: [],
    next: [],
    nextField: null,
    activeField: null,
    requestedField: null,
  });

  const pause = !(page && state.query);

  const [{ data, fetching, stale }, fetchSuggestions] = useSearchSuggestionsQuery({
    pause,
    requestPolicy: 'network-only',
    variables: pause
      ? ({} as QuerySearchArgs)
      : ({
          ...state.query,
          page: page as string as SearchPage,
          numResults: numToRequest,
        } as QuerySearchArgs),
  });

  const debouncedFetch = useDebounceCallback(fetchSuggestions, 100);
  const isEnabled = isSearchPage(page) && !!state.query;

  const clear = useCallback(() => {
    setState((last) => ({ ...last, list: [], next: [] }));
  }, []);

  useEffect(() => {
    if (isEnabled) {
      debouncedFetch();
    } else {
      clear();
    }
  }, [debouncedFetch, isEnabled, clear, state.query?.searchTerm]);

  useEffect(() => {
    setState((last) => {
      if (
        state.query &&
        last.activeField === state.query.column &&
        data?.search &&
        (state.query.searchTerm === data?.search.searchTerm || last.list.length > 0) &&
        !fetching &&
        !stale
      ) {
        const list = data.search.list ?? [];
        const next = data.search.nextCategory ?? [];
        const nextField = data.search.nextField ?? null;

        return {
          ...last,
          list,
          next,
          nextField: nextField as FieldKey<I>,
        };
      }
      return last;
    });
  }, [state.query, data, fetching, stale]);

  const onType = useCallback(
    (field: FieldKey<I>, value: string): void => {
      const enabled = suggestionFields.includes(field);
      if (!(enabled && isSearchItem(field))) {
        return;
      }
      setState((last) => ({
        ...last,
        activeField: field,
        query: value ? { column: field, searchTerm: sanitizeValue(value) } : null,
      }));
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
        query: null,
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

  const focusTimer = useRef<number>();
  useEffect(
    () => (): void => {
      clearTimeout(focusTimer.current);
    },
    [],
  );

  const activateSuggestion = useCallback(
    (index: number): void => {
      if (index < 0 || index > state.list.length - 1 || !state.activeField) {
        return;
      }

      const nextValue = state.next[index] ?? null;
      const nextField = state.nextField ?? naturalNextField;

      setDelta((last: Partial<I>): Partial<I> => {
        const withMain: Partial<I> = {
          ...last,
          [state.activeField ?? '']: state.list[index],
        };

        return nextValue && nextField ? { ...withMain, [nextField]: nextValue } : withMain;
      });
      focusTimer.current = window.setTimeout(() => {
        setState((last) => ({
          ...last,
          activeField: nextField === ADD_BUTTON ? ADD_BUTTON : null,
          list: [],
          next: [],
          query: null,
          requestedField: null,
        }));
        if (nextField !== ADD_BUTTON) {
          focusTimer.current = window.setTimeout(() => {
            setState((last) => ({
              ...last,
              activeField: nextField,
              nextField: null,
            }));
          }, 0);
        }
      }, 0);
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
    clear,
  };
}
