import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

import { AccessibleListItemField } from '../field';
import * as Styled from '../styles';
import { useSuggestions, Result as Suggestions } from '../suggestions';
import { Fields, FieldKey, PropsItemCreate, ADD_BUTTON } from '../types';
import { useCTA } from '~client/hooks';
import { Button } from '~client/styled/shared';
import { ListItemInput, PageList } from '~client/types';

const deltaIsComplete = <I extends ListItemInput>(delta: Partial<I> | I): delta is I =>
  Object.keys(delta).every((key) => typeof Reflect.get(delta, key) !== 'undefined');

const Suggestion: React.FC<{
  suggestion: string;
  index: number;
  activateSuggestion: (index: number) => void;
}> = ({ suggestion, index, activateSuggestion }) => {
  const onActivate = useCallback((): void => activateSuggestion(index), [
    index,
    activateSuggestion,
  ]);
  const { onClick, onKeyDown } = useCTA(onActivate);

  return (
    <li>
      <Styled.SuggestionButton onClick={onClick} onKeyDown={onKeyDown}>
        {suggestion}
      </Styled.SuggestionButton>
    </li>
  );
};

type FieldProps<I extends ListItemInput, E extends Record<string, unknown>> = {
  fields: Fields<I, E>;
  field: FieldKey<I>;
  delta: Partial<I>;
  setDelta: React.Dispatch<React.SetStateAction<Partial<I>>>;
  active: boolean;
  suggestions?: string[];
  activateSuggestion: Suggestions<I>['activateSuggestion'];
} & Omit<Suggestions<I>, 'list' | 'next' | 'activate' | 'activeField'>;

const CreateField = <I extends ListItemInput, E extends Record<string, unknown>>({
  fields,
  field,
  delta,
  setDelta,
  onType: requestSuggestions,
  suggestions,
  activateSuggestion,
  active,
  setActiveField,
}: FieldProps<I, E>): React.ReactElement<FieldProps<I, E>> => {
  const onChange = useCallback(
    (newValue): void => {
      setDelta((last) => ({
        ...last,
        [field]: newValue,
      }));
    },
    [field, setDelta],
  );

  const onType = useCallback((newValue): void => requestSuggestions(field, String(newValue)), [
    requestSuggestions,
    field,
  ]);

  const onFocus = useCallback(() => setActiveField(field), [setActiveField, field]);
  return (
    <Styled.CreateField>
      <AccessibleListItemField
        Field={fields[field]}
        field={field}
        value={delta[field]}
        onChange={onChange}
        onType={onType}
        onFocus={onFocus}
        active={active}
        allowEmpty
      />
      {(suggestions?.length ?? 0) > 0 && (
        <Styled.SuggestionList>
          {suggestions?.map((suggestion, index) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              index={index}
              activateSuggestion={activateSuggestion}
            />
          ))}
        </Styled.SuggestionList>
      )}
    </Styled.CreateField>
  );
};

export const AccessibleListCreateItem = <
  I extends ListItemInput,
  P extends PageList,
  E extends Record<string, unknown> = never
>({
  page,
  fields,
  onCreate,
  suggestionFields = [],
  deltaSeed,
}: PropsItemCreate<I, P, E>): React.ReactElement<PropsItemCreate<I, P, E>> => {
  const initialDelta = useMemo<Partial<I>>(
    (): Partial<I> =>
      Object.keys(fields).reduce(
        (last, key) => ({
          [key]: undefined,
          ...last,
        }),
        deltaSeed?.() ?? {},
      ),
    [fields, deltaSeed],
  );
  const [delta, setDelta] = useState<Partial<I>>(initialDelta);

  const fieldKeys = Object.keys(fields) as FieldKey<I>[];
  const {
    activeField,
    setActiveField,
    onType,
    activateSuggestion,
    list: suggestions,
  } = useSuggestions<I, P>({
    suggestionFields,
    page,
    fields: fieldKeys,
    setDelta,
  });

  const addButton = useRef<HTMLButtonElement>(null);
  const addButtonFocused = activeField === ADD_BUTTON;
  useEffect(() => {
    if (addButtonFocused) {
      setImmediate(() => {
        if (addButton.current) {
          addButton.current.focus();
        }
      });
    }
  }, [addButtonFocused]);

  const firstField = fieldKeys[0];
  const onCreateIfPossible = useCallback((): void => {
    if (deltaIsComplete(delta)) {
      onCreate(delta);
      setDelta(initialDelta);
      setImmediate(() => {
        setActiveField(firstField);
      });
    }
  }, [onCreate, delta, initialDelta, setActiveField, firstField]);

  const createEvents = useCTA(onCreateIfPossible);

  return (
    <Styled.CreateRow data-testid="create-form">
      {fieldKeys.map((field: FieldKey<I>) => (
        <CreateField
          key={String(field)}
          fields={fields}
          field={field}
          delta={delta}
          setDelta={setDelta}
          onType={onType}
          suggestions={activeField === field ? suggestions : undefined}
          activateSuggestion={activateSuggestion}
          active={activeField === field}
          setActiveField={setActiveField}
        />
      ))}
      <Button {...createEvents} ref={addButton}>
        Add
      </Button>
    </Styled.CreateRow>
  );
};
