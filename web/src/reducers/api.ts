import { Action, ActionTypeApi, ActionTypeLogin, ActionApiDataRead } from '~client/actions';
import { AppConfig, NativeDate } from '~client/types';

export type State = {
  loading: number;
  error: Error | null;
  appConfig: NativeDate<Pick<AppConfig, 'birthDate'>, 'birthDate'>;
};

export const initialState: State = {
  loading: 0,
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
    case ActionTypeApi.Loading:
      return { ...state, loading: state.loading + 1 };
    case ActionTypeApi.Loaded:
      return { ...state, loading: Math.max(0, state.loading - 1) };

    case ActionTypeLogin.LoggedOut:
      return initialState;

    default:
      return state;
  }
}
