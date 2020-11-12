import { AxiosInstance } from 'axios';
import { useCallback, useState, useMemo, useEffect } from 'react';

import { FieldKey, ActiveField, ADD_BUTTON } from './types';
import { API_PREFIX } from '~client/constants/data';
import { useCancellableRequest } from '~client/hooks';
import { isEscape } from '~client/modules/nav';
import { Create, Item } from '~client/types';

type Options<I extends Item, P extends string> = {
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

const stateEmpty = { list: [], next: [], nextField: null, requestedField: null };

type SuggestionRequest<I extends Item, F extends FieldKey<I> = FieldKey<I>> = [F, string];

export function useSuggestions<I extends Item, P extends string>({
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

  const [suggestionRequest, setSuggestionRequest] = useState<SuggestionRequest<I> | undefined>();

  const requestSuggestions = useCallback(
    <I extends Item>(axios: AxiosInstance, [field, value]: SuggestionRequest<I>) =>
      axios.get<SuggestionsResponse<I, typeof field>>(
        `${API_PREFIX}/data/search/${page}/${field}/${sanitizeValue(value)}/${numToRequest}`,
      ),
    [page],
  );

  const handleResponse = useCallback(
    <F extends FieldKey<I>>(res: SuggestionsResponse<I, F>, [field]: SuggestionRequest<I, F>) => {
      const list = res.data?.list ?? [];
      const next = res.data?.nextCategory ?? [];
      const nextField = res.data?.nextField ?? null;

      setState((last) =>
        last.activeField === field
          ? {
              ...last,
              list,
              next,
              nextField,
              requestedField: field,
            }
          : last,
      );
    },
    [],
  );

  useCancellableRequest<
    SuggestionRequest<I> | undefined,
    SuggestionsResponse<I, FieldKey<I>>,
    SuggestionRequest<I>
  >({
    query: suggestionRequest,
    sendRequest: requestSuggestions,
    handleResponse,
  });

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
        setSuggestionRequest([field, value]);
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
        (last: Partial<Create<I>>): Partial<Create<I>> => {
          const withMain: Partial<Create<I>> = {
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
