import shortid from 'shortid';

import * as actions from '~client/constants/actions/error';

export const errorOpened = message => ({
    type: actions.ERROR_OPENED,
    message,
    id: shortid.generate()
});

export const errorClosed = id => ({
    type: actions.ERROR_CLOSED,
    id
});

export const errorRemoved = id => ({
    type: actions.ERROR_REMOVED,
    id
});
