import { State } from '~/reducers';

export const getCurrentPathname = (state: State): string => state.router.location.pathname;
