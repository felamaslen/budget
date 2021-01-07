import React from 'react';

export const enum ActionType {
  ValueSet = 'VALUE_SET',
  Cancelled = 'CANCELLED',
}

export const isEnter = (event: KeyboardEvent | React.KeyboardEvent): boolean =>
  event.key === 'Enter';
export const isEscape = (event: KeyboardEvent | KeyboardEvent): boolean => event.key === 'Escape';
