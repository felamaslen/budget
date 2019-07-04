import shortid from 'shortid';

import * as actions from '~client/constants/actions/error';
import { ERROR_LEVEL_ERROR } from '~client/constants/error';

export const errorOpened = (text, level = ERROR_LEVEL_ERROR) => ({
    type: actions.ERROR_OPENED,
    message: { text, level },
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
