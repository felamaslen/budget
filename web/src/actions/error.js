import * as actions from '~client/actions/error';
import { uuid } from '~client/modules/data';

export const errorOpened = message => ({
    type: actions.ERROR_OPENED,
    message,
    id: uuid()
});

export const errorClosed = id => ({
    type: actions.ERROR_CLOSED,
    id
});

export const errorRemoved = id => ({
    type: actions.ERROR_REMOVED,
    id
});
