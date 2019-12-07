import { RouterState } from 'connected-react-router';
import { State } from '~/reducers';

export const getCurrentPathname = (state: State | { router: RouterState }): string =>
  state.router.location.pathname;
