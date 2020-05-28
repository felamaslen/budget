import shortid from 'shortid';

import { ErrorLevel } from '~client/constants/error';

export enum ActionTypeError {
  Opened = '@@error/OPENED',
  Closed = '@@error/CLOSED',
  Removed = '@@error/REMOVED',
}

type ActionErrorOpened = {
  type: ActionTypeError.Opened;
  message: {
    text: string;
    level: ErrorLevel;
  };
  id: string;
};

export const errorOpened = (
  text: string,
  level: ErrorLevel = ErrorLevel.Err,
): ActionErrorOpened => ({
  type: ActionTypeError.Opened,
  message: { text, level },
  id: shortid.generate(),
});

type ActionErrorClosed = {
  type: ActionTypeError.Closed;
  id: string;
};

export const errorClosed = (id: string): ActionErrorClosed => ({
  type: ActionTypeError.Closed,
  id,
});

type ActionErrorRemoved = {
  type: ActionTypeError.Removed;
  id: string;
};

export const errorRemoved = (id: string): ActionErrorRemoved => ({
  type: ActionTypeError.Removed,
  id,
});

export type ActionError = ActionErrorOpened | ActionErrorClosed | ActionErrorRemoved;
