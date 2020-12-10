import { Action, ActionTypeApi, ActionTypeLogin, ActionApiDataRead } from '~client/actions';
import { AppConfig, NativeDate } from '~client/types';

export type State = {
  loading: boolean;
  locked: boolean;
  error: Error | null;
  appConfig: NativeDate<Pick<AppConfig, 'birthDate'>, 'birthDate'>;
};

export const initialState: State = {
  loading: false,
  locked: false,
  error: null,
  appConfig: {
    birthDate: new Date('1990-01-01'),
  },
};

const onDataRead = (state: State, action: ActionApiDataRead): State => ({
  ...state,
  appConfig: action.res.config
    ? {
        birthDate: new Date(action.res.config.birthDate),
      }
    : state.appConfig,
});

export default function api(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.DataRead:
      return onDataRead(state, action);

    case ActionTypeLogin.LoggedOut:
      return initialState;

    default:
      return state;
  }
}
