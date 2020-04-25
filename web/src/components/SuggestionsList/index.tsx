import { connect } from 'react-redux';
import React, { useReducer, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'throttle-debounce';
import shortid from 'shortid';

import { State as AppState } from '~client/reducers';
import { suggestionsRequested, suggestionsCleared } from '~client/actions/suggestions';
import { isCtrl, isEnter, getNavDirection } from '~client/modules/nav';

import * as Styled from './styles';

enum ActionType {
  NavPrev,
  NavNext,
  ListSizeSet,
  Confirmed,
}

type ActionNavPrev = {
  type: ActionType.NavPrev;
};
type ActionNavNext = {
  type: ActionType.NavNext;
};
type ActionListSizeSet = {
  type: ActionType.ListSizeSet;
  size: number;
};
type ActionConfirmed = {
  type: ActionType.Confirmed;
};

type Action = ActionNavPrev | ActionNavNext | ActionListSizeSet | ActionConfirmed;

type State = {
  size: number;
  active: number | null;
  confirm: string | null;
  prevConfirm: string | null;
};

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (state, action): State => {
  if (action.type === ActionType.ListSizeSet) {
    if (!action.size) {
      return { ...state, size: 0, active: null };
    }
    if (action.size < (state.active ?? 0)) {
      return { ...state, size: action.size, active: 0 };
    }

    return { ...state, size: action.size };
  }
  if (!state.size) {
    return state;
  }
  if (action.type === ActionType.NavPrev) {
    return {
      ...state,
      active: (((state.active ?? 0) - 1 + state.size) % state.size) % state.size,
    };
  }
  if (action.type === ActionType.NavNext) {
    if (state.active === null) {
      return { ...state, active: 0 };
    }

    return { ...state, active: (state.active + 1) % state.size };
  }
  if (action.type === ActionType.Confirmed) {
    if (state.active === null || state.active >= state.size) {
      return { ...state, confirm: null };
    }

    return {
      ...state,
      confirm: shortid.generate(),
      prevConfirm: state.confirm,
    };
  }

  return state;
};

type StateProps = {
  list: string[];
  next: string[];
};

type DispatchProps = {
  request: (page: string, column: string, search: string) => void;
  clear: () => void;
};

type Props = StateProps &
  DispatchProps & {
    page: string;
    column: string;
    search: string;
    onConfirm: (value: string, nextValue: string | null) => void;
  };

const SuggestionsList: React.FC<Props> = ({
  page,
  column,
  search,
  onConfirm,
  list,
  next,
  request,
  clear,
}) => {
  const [state, dispatch] = useReducer<Reducer>(reducer, {
    size: list.length,
    active: null,
    confirm: null,
    prevConfirm: null,
  });
  useEffect(() => {
    dispatch({ type: ActionType.ListSizeSet, size: list.length });
  }, [list.length, next]);

  const requestDebounced = useMemo(() => debounce(100, request), [request]);

  useEffect(() => {
    if (search.length) {
      requestDebounced(page, column, search);
    } else {
      clear();
    }
  }, [requestDebounced, clear, page, column, search]);

  useEffect(() => clear, [clear]);

  const { size, active } = state;
  const haveList = size > 0;

  useEffect(() => {
    if (state.confirm && state.confirm !== state.prevConfirm && haveList && state.active !== null) {
      const nextValue = state.active < next.length ? next[state.active] : null;

      onConfirm(list[state.active], nextValue);
    }
  }, [state.confirm, state.prevConfirm, haveList, state.active, next, list, onConfirm]);

  const onKey = useCallback(event => {
    if (isCtrl(event)) {
      return null;
    }
    if (isEnter(event)) {
      return dispatch({ type: ActionType.Confirmed });
    }

    const { dy } = getNavDirection(event);
    if (!dy) {
      return null;
    }

    event.stopPropagation();

    if (dy > 0) {
      return dispatch({ type: ActionType.NavNext });
    }

    return dispatch({ type: ActionType.NavPrev });
  }, []);

  useEffect(() => {
    if (haveList) {
      window.addEventListener('keydown', onKey);
    } else {
      window.removeEventListener('keydown', onKey);
    }
  }, [onKey, haveList]);

  useEffect(() => (): void => window.removeEventListener('keydown', onKey), [onKey]);

  if (!haveList) {
    return null;
  }

  return (
    <Styled.Suggestions>
      {list.map((value, index) => (
        <Styled.Suggestion key={value} active={index === active}>
          {value}
        </Styled.Suggestion>
      ))}
    </Styled.Suggestions>
  );
};

const mapStateToProps = (state: Pick<AppState, 'suggestions'>): StateProps => ({
  list: state.suggestions.list,
  next: state.suggestions.next,
});

const mapDispatchToProps = {
  request: suggestionsRequested,
  clear: suggestionsCleared,
};

export default connect(mapStateToProps, mapDispatchToProps)(SuggestionsList);
