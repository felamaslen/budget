import { IncludeOne } from '~/types/utils';
import { State as GlobalStateWithRouter } from '~/reducers';

export type State = IncludeOne<GlobalStateWithRouter, 'router'>;

export const getCurrentPathname = (state: State): string => state.router.location.pathname;
