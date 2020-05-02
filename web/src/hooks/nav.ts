import { useReducer, useCallback, useEffect } from 'react';

import { PageList } from '~client/types/app';
import {
  ActionType,
  isEscape,
  isEnter,
  isCtrl,
  getNavDirection,
  DirectionDelta,
} from '~client/modules/nav';
import { CREATE_ID, PAGES } from '~client/constants/data';

export { ActionType } from '~client/modules/nav';

export enum Button {
  Add = 'ADD_BTN',
}

export const ADD_BTN = Button.Add;

export const ITEMS_SET = ActionType.ItemsSet;
export const COLUMNS_SET = ActionType.ColumnsSet;
export const NAV_TOGGLED = ActionType.NavToggled;
export const NAV_NEXT = ActionType.NavNext;
export const NAV_PREV = ActionType.NavPrev;
export const NAV_XY = ActionType.NavXY;
export const ACTIVE_SET = ActionType.ActiveSet;

type Column<I extends {} = {}> = keyof I;

type Command<I extends {} = {}, T = never> = Partial<{
  type: ActionType;
  id: string | null;
  column: Column<I> | Button | null;
  payload: T;
}>;

export const NULL_COMMAND: Command = {};

export type State<I extends {} = {}> = {
  nav: boolean;
  command?: Command<I>;
  items: I[];
  columns: Column<I>[];
  activeId: string | null;
  activeItem: I | null;
  activeColumn: Column<I> | Button | null;
};

export type ActionItemsSet<I extends {}> = { type: ActionType.ItemsSet; items: I[] };
export type ActionColumnsSet<I extends {}> = { type: ActionType.ColumnsSet; columns: Column<I>[] };
export type ActionNavToggled = { type: ActionType.NavToggled };
export type ActionNavNext = { type: ActionType.NavNext };
export type ActionNavPrev = { type: ActionType.NavPrev };
export type ActionNavXY = { type: ActionType.NavXY } & DirectionDelta;
export type ActionActiveSet<I extends {}> = {
  type: ActionType.ActiveSet;
  id: string | null;
  column?: Column<I> | null;
};
export type ActionCommandSet<I extends {}, T = never> = {
  type: ActionType.CommandSet;
  command: ActionType;
  id?: string;
  activeId?: string;
  activeColumn?: Column<I>;
  column?: Column<I>;
  payload?: T;
};

type Action<I extends { id: string }> =
  | ActionItemsSet<I>
  | ActionColumnsSet<I>
  | ActionNavToggled
  | ActionNavNext
  | ActionNavPrev
  | ActionNavXY
  | ActionActiveSet<I>
  | ActionCommandSet<I>;

type Reducer<I extends { id: string }> = (state: State<I>, action: Action<I>) => State<I>;

function navNext<I extends { id: string }>(state: State<I>): State<I> {
  if (state.activeId === null || !state.items.length) {
    return { ...state, activeId: CREATE_ID };
  }
  if (state.activeId === CREATE_ID) {
    return { ...state, activeId: state.items[0].id };
  }

  const index = state.items.findIndex(({ id }) => id === state.activeId);
  if (index === -1 || index >= state.items.length - 1) {
    return { ...state, activeId: CREATE_ID };
  }

  return { ...state, activeId: state.items[index + 1].id };
}

function navPrev<I extends { id: string }>(state: State<I>): State<I> {
  if (!state.items.length) {
    return { ...state, activeId: CREATE_ID };
  }
  if (state.activeId === CREATE_ID || state.activeId === null) {
    return { ...state, activeId: state.items[state.items.length - 1].id };
  }

  const index = state.items.findIndex(({ id }) => id === state.activeId);
  if (index < 1) {
    return { ...state, activeId: CREATE_ID };
  }

  return { ...state, activeId: state.items[index - 1].id };
}

function getNextActiveColumn<I extends {}>(state: State<I>): Column<I> | Button | null {
  if (state.activeColumn === ADD_BTN) {
    return state.columns[state.columns.length - 1];
  }
  if (!state.activeColumn) {
    return state.columns[0];
  }

  return state.activeColumn;
}

const itemColumnIsActive = <I extends { id: string }>(
  activeColumn: Column<I> | Button | null,
): activeColumn is Column<I> => !!activeColumn && activeColumn !== Button.Add;

function navXYHelper<I extends { id: string }>(
  state: State<I>,
  delta: DirectionDelta,
): Partial<State<I>> {
  const rowIndex = state.items.findIndex(({ id }) => id === state.activeId);
  const columnIndex = itemColumnIsActive<I>(state.activeColumn)
    ? state.columns.indexOf(state.activeColumn)
    : -1;

  if (delta.dx > 0) {
    if (!state.activeId) {
      return { activeId: CREATE_ID, activeColumn: state.columns[0] };
    }
    if (state.activeId === CREATE_ID) {
      if (state.activeColumn === ADD_BTN) {
        return { ...navNext(state), activeColumn: state.columns[0] };
      }
      if (columnIndex < state.columns.length - 1) {
        return { activeColumn: state.columns[columnIndex + 1] };
      }

      return { activeColumn: ADD_BTN };
    }

    if (columnIndex < state.columns.length - 1) {
      return { activeColumn: state.columns[columnIndex + 1] };
    }

    return { ...navNext(state), activeColumn: state.columns[0] };
  }
  if (delta.dx < 0) {
    if (!state.activeId) {
      return { ...navPrev(state), activeColumn: state.columns[state.columns.length - 1] };
    }
    if (state.activeId === CREATE_ID) {
      if (state.activeColumn === ADD_BTN) {
        return { activeColumn: state.columns[state.columns.length - 1] };
      }
      if (columnIndex > 0) {
        return { activeColumn: state.columns[columnIndex - 1] };
      }

      return { ...navPrev(state), activeColumn: state.columns[state.columns.length - 1] };
    }

    if (columnIndex > 0) {
      return { activeColumn: state.columns[columnIndex - 1] };
    }

    if (rowIndex === 0) {
      return { ...navPrev(state), activeColumn: ADD_BTN };
    }

    return { ...navPrev(state), activeColumn: state.columns[state.columns.length - 1] };
  }
  if (delta.dy > 0) {
    const activeColumn = getNextActiveColumn(state);

    return { ...navNext(state), activeColumn };
  }
  if (delta.dy < 0) {
    const activeColumn = getNextActiveColumn(state);

    return { ...navPrev(state), activeColumn };
  }

  return {};
}

function navXY<I extends { id: string }>(
  state: State<I>,
  { dx = 0, dy = 0 }: Partial<DirectionDelta>,
): State<I> {
  const delta: DirectionDelta = { dx, dy };
  if (!(state.columns && state.columns.length)) {
    if (delta.dx > 0 || delta.dy > 0) {
      return navNext(state);
    }

    return navPrev(state);
  }

  return { ...state, ...navXYHelper(state, delta) };
}

function navReducerHelper<I extends { id: string }>(state: State<I>, action: Action<I>): State<I> {
  if (action.type === ActionType.CommandSet) {
    return {
      ...state,
      command: {
        type: action.command,
        id: action.id ?? state.activeId,
        column: action.column || state.activeColumn,
        payload: action.payload,
      },
      activeId: action.activeId || state.activeId,
      activeColumn: action.activeColumn || state.activeColumn,
    };
  }
  if (action.type === ActionType.ItemsSet) {
    return { ...state, items: action.items };
  }
  if (action.type === ActionType.ColumnsSet) {
    return { ...state, columns: action.columns };
  }
  if (action.type === ActionType.NavToggled) {
    return { ...state, nav: !state.nav, activeId: null };
  }
  if (action.type === ActionType.ActiveSet) {
    return { ...state, activeId: action.id, activeColumn: action.column ?? null };
  }
  if (!state.nav) {
    return state;
  }
  if (action.type === ActionType.NavNext) {
    return navNext(state);
  }
  if (action.type === ActionType.NavPrev) {
    return navPrev(state);
  }
  if (action.type === ActionType.NavXY) {
    return navXY(state, action);
  }

  return state;
}

export function navReducer<I extends { id: string }>(state: State<I>, action: Action<I>): State<I> {
  const nextState = navReducerHelper(state, action);

  if (!(nextState.activeId === state.activeId && nextState.items === state.items)) {
    return {
      ...nextState,
      activeItem:
        nextState.activeId && nextState.activeId !== CREATE_ID
          ? nextState.items.find(({ id }) => id === nextState.activeId) ?? null
          : null,
    };
  }

  return nextState;
}

const getColumns = <I extends { id: string }>(page?: PageList): Column<I>[] =>
  (page && ((PAGES[page].cols ?? []) as Column<I>[])) ?? [];

type SetCommand<I extends { id: string }> = (
  action:
    | ActionType
    | (Omit<Action<I>, 'type'> & {
        command: ActionType;
      }),
) => void;

export function useNav<I extends { id: string }>(
  nav: boolean,
  items: I[],
  page?: PageList,
): [State<I>, (id: string, column: string) => void, SetCommand<I>, () => void, () => void] {
  const [state, dispatch] = useReducer<Reducer<I>>(navReducer, {
    nav: false,
    command: NULL_COMMAND,
    items,
    columns: getColumns(page),
    activeId: null,
    activeItem: null,
    activeColumn: null,
  });

  useEffect(() => {
    dispatch({ type: ActionType.ItemsSet, items });
  }, [items]);

  useEffect(() => {
    dispatch({ type: ActionType.ColumnsSet, columns: getColumns(page) });
  }, [page]);

  useEffect(() => {
    if (nav !== state.nav) {
      dispatch({ type: ActionType.NavToggled });
    }
  }, [nav, state.nav]);

  const setActive = useCallback(
    (id, column) => dispatch({ type: ActionType.ActiveSet, id, column }),
    [],
  );

  const onNext = useCallback(() => dispatch({ type: ActionType.NavNext }), []);
  const onPrev = useCallback(() => dispatch({ type: ActionType.NavPrev }), []);

  const setCommand = useCallback<SetCommand<I>>(action => {
    if (typeof action === 'string') {
      dispatch({ type: ActionType.CommandSet, command: action });
    } else {
      dispatch({ type: ActionType.CommandSet, ...action });
    }
  }, []);

  const onKey = useCallback(event => {
    if (isEscape(event)) {
      event.preventDefault();
      dispatch({ type: ActionType.CommandSet, command: ActionType.Cancelled });

      return setImmediate(() => dispatch({ type: ActionType.ActiveSet, id: null, column: null }));
    }
    if (isEnter(event) && isCtrl(event)) {
      return dispatch({ type: ActionType.ActiveSet, id: null, column: null });
    }

    const { dx, dy } = getNavDirection(event, true);
    return dispatch({ type: ActionType.NavXY, dx, dy });
  }, []);

  useEffect(() => {
    if (!state.nav && nav) {
      window.addEventListener('keydown', onKey);
    } else if (!nav && state.nav) {
      window.removeEventListener('keydown', onKey);
    }
  }, [nav, state.nav, onKey]);

  useEffect(
    () => (): void => {
      window.removeEventListener('keydown', onKey);
    },
    [onKey],
  );

  return [state, setActive, setCommand, onNext, onPrev];
}
