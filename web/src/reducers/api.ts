import { Action, ActionTypeApi, ActionTypeLogin, ActionTypeFunds } from '~client/actions';
import { defaultFundLength, defaultFundPeriod } from '~client/constants';
import type { GQL, HistoryOptions } from '~client/types';
import { AppConfig } from '~client/types/gql';

export type LocalAppConfig = {
  birthDate: string;
  historyOptions: HistoryOptions;
};

export type State = {
  loading: number;
  error: Error | null;
  appConfig: LocalAppConfig;
  appConfigSerial: number;
};

const defaultHistoryOptions: HistoryOptions = {
  period: defaultFundPeriod,
  length: defaultFundLength,
};

export const initialState: State = {
  loading: 0,
  error: null,
  appConfig: {
    birthDate: '1990-01-01',
    historyOptions: defaultHistoryOptions,
  },
  appConfigSerial: 0,
};

const updateConfig = (state: State, updatedConfig: Partial<LocalAppConfig>): State => ({
  ...state,
  appConfig: { ...state.appConfig, ...updatedConfig },
  appConfigSerial: state.appConfigSerial + 1,
});

const updateConfigRemote = (state: State, updatedConfig: Partial<GQL<AppConfig>>): State => ({
  ...state,
  appConfig: {
    ...state.appConfig,
    birthDate: updatedConfig.birthDate ?? state.appConfig.birthDate,
    historyOptions: {
      period: updatedConfig.fundPeriod ?? state.appConfig.historyOptions.period,
      length: updatedConfig.fundLength ?? state.appConfig.historyOptions.length,
    },
  },
});

export default function api(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.ConfigUpdated:
      return updateConfigRemote(state, action.config);
    case ActionTypeApi.Loading:
      return { ...state, loading: state.loading + 1 };
    case ActionTypeApi.Loaded:
      return { ...state, loading: Math.max(0, state.loading - 1) };

    case ActionTypeLogin.LoggedOut:
      return initialState;

    case ActionTypeFunds.QueryUpdated:
      return updateConfig(state, {
        historyOptions: action.historyOptions,
      });

    default:
      return state;
  }
}
