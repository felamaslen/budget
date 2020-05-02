import { KeyboardEvent } from 'react';

export enum ActionType {
  ValueSet = 'VALUE_SET',
  Cancelled = 'CANCELLED',
  ItemsSet = 'ITEMS_SET',
  ColumnsSet = 'COLUMNS_SET',
  NavToggled = 'NAV_TOGGLED',
  NavNext = 'NAV_NEXT',
  NavPrev = 'NAV_PREV',
  NavXY = 'NAV_XY',
  ActiveSet = 'ACTIVE_SET',
  CommandSet = 'COMMAND_SET',
}

export const CANCELLED = ActionType.Cancelled;
export const VALUE_SET = ActionType.ValueSet;

export const isShift = (event: KeyboardEvent): boolean => event.shiftKey;
export const isCtrl = (event: KeyboardEvent): boolean => event.ctrlKey;
export const isEnter = (event: KeyboardEvent): boolean => event.key === 'Enter';
export const isEscape = (event: KeyboardEvent): boolean => event.key === 'Escape';
export const isTab = (event: KeyboardEvent): boolean => event.key === 'Tab';

export type DirectionDelta = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

export const Direction: Record<'identity' | 'up' | 'down' | 'left' | 'right', DirectionDelta> = {
  identity: { dx: 0, dy: 0 },
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function getNavDirection(
  event: KeyboardEvent,
  requireArrowModifier = false,
): DirectionDelta {
  if (isTab(event)) {
    if (isShift(event)) {
      return Direction.left;
    }

    return Direction.right;
  }

  if (requireArrowModifier && !isCtrl(event)) {
    return Direction.identity;
  }
  if (event.key === 'ArrowUp') {
    return Direction.up;
  }
  if (event.key === 'ArrowDown') {
    return Direction.down;
  }
  if (event.key === 'ArrowLeft') {
    return Direction.left;
  }
  if (event.key === 'ArrowRight') {
    return Direction.right;
  }

  return Direction.identity;
}
