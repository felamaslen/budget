import * as actions from '~client/constants/actions/app';

export const windowResized = (size) => ({ type: actions.WINDOW_RESIZED, size });
