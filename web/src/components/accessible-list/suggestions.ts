import axios, { Canceler } from 'axios';
import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'throttle-debounce';

import { FieldKey, State as PageState, ActiveField, ADD_BUTTON } from './types';
import { API_PREFIX } from '~client/constants/data';
import { Create, Item } from '~client/types';

export type Options<I extends Item, P extends string> = {
  suggestionFields: FieldKey<I>[];
  fields: FieldKey<I>[];
  page: P;
  setDelta: React.Dispatch<React.SetStateAction<Partial<Create<I>>>>;
};

export type Result<I extends Item> = {
  onType: (field: FieldKey<I>, value: string) => void;
  list: string[];
  next: string[];
  activateSuggestion: (index: number) => void;
  activeField: ActiveField<I>;
  setActiveField: (field: FieldKey<I>) => void;
};

type SuggestionsResponse<I extends Item, F extends FieldKey<I>> = {
  data: {
    list: string[];
    nextCategory?: string[];
    nextField?: F;
  };
};

const sanitizeValue = (value: string): string =>
  value.replace(/[^A-Za-z\s]+/g, '').replace(/\s+/g, ' ');

const numToRequest = 5;

type State<I extends Item> = {
  list: string[];
  next: string[];
  nextField: ActiveField<I>;
  activeField: ActiveField<I>;
  requestedField: FieldKey<I> | null;
};

const maybeGetApiKey = <I extends Item, P extends string>(state: PageState<I, P>): string | null =>
  state.api?.key ?? null;

const stateEmpty = { list: [], next: [], nextField: null, requestedField: null };

export function useSuggestions<I extends Item, P extends string>({
  suggestionFields,
  fields,
  page,
  setDelta,
}: Options<I, P>): Result<I> {
  const apiKey = useSelector(maybeGetApiKey);

  const [state, setState] = useState<State<I>>({
    list: [],
    next: [],
    nextField: null,
    activeField: null,
    requestedField: null,
  });

  const cancelRequest = useRef<Canceler>();
  const requestSuggestions = useMemo(
    () =>
      debounce<<F extends FieldKey<I>>(field: F, value: string) => () => void>(
        100,
        <F extends FieldKey<I>>(field: F, value: string): (() => void) => {
          let cancelled = false;
          const request = async (): Promise<void> => {
            try {
              if (cancelRequest.current) {
                cancelRequest.current();
              }
              const res = await axios.get<SuggestionsResponse<I, F>>(
                `${API_PREFIX}/data/search/${page}/${field}/${sanitizeValue(
                  value,
                )}/${numToRequest}`,
                {
                  headers: {
                    authorization: apiKey,
                  },
                  cancelToken: new axios.CancelToken((token): void => {
                    cancelRequest.current = token;
                  }),
                },
              );
              if (cancelled) {
                return;
              }

              const { data } = res.data;

              setState((last) =>
                last.activeField === field
                  ? {
                      ...last,
                      list: data.list,
                      next: data.nextCategory ?? [],
                      nextField: data.nextField ?? null,
                      requestedField: field,
                    }
                  : last,
              );
            } catch (err) {
              if (!axios.isCancel(err)) {
                throw err; // TODO: display error message
              }
            }
          };

          request();
          return (): void => {
            cancelled = true;
          };
        },
      ),
    [page, apiKey],
  );

  const onType = useCallback(
    (field: FieldKey<I>, value: string): void => {
      const enabled = suggestionFields.includes(field);
      if (!enabled) {
        return;
      }
      setState((last) =>
        last.activeField === field ? last : { ...last, activeField: field, ...stateEmpty },
      );
      if (value) {
        requestSuggestions(field, value);
      } else {
        setState((last) => ({ ...last, ...stateEmpty }));
      }
    },
    [suggestionFields, requestSuggestions],
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
        (last: Partial<Create<I>>): Partial<Create<I>> => {
          const withMain: Partial<Create<I>> = {
            ...last,
            [state.activeField ?? '']: state.list[index],
          };
          if (nextValue && nextField) {
            return { ...withMain, [nextField]: nextValue };
          }
          return withMain;
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
      if (event.key === 'Escape') {
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
