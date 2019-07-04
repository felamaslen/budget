import { DateTime } from 'luxon';

import { TIME_UPDATED } from '~client/constants/actions/now';

export const initialState = DateTime.local();

export default (state = initialState, action) => {
    if (!(action && action.type === TIME_UPDATED)) {
        return state;
    }

    const now = DateTime.local();

    if (state && now.hasSame(state, 'second')) {
        return state;
    }

    return now;
};
