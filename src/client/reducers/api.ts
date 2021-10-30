import isValidDate from 'date-fns/isValid';

import { Action, ActionTypeApi, ActionTypeLogin, ActionTypeFunds } from '~client/actions';
import type { HistoryOptions, LocalAppConfig } from '~client/types';
import type { AppConfig } from '~client/types/gql';

import {
  defaultFundLength,
  defaultFundMode,
  defaultFundPeriod,
  defaultRealTimePrices,
} from '~shared/constants';
import type { GQL } from '~shared/types';

export type State = {
  loading: number;
  error: Error | null;
  appConfig: LocalAppConfig;
  appConfigSerial: number;
  settingsOpen: boolean;
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
    realTimePrices: defaultRealTimePrices,
    fundMode: defaultFundMode,
    historyOptions: defaultHistoryOptions,
  },
  appConfigSerial: 0,
  settingsOpen: false,
};

const updateConfig = (state: State, updatedConfig: Partial<LocalAppConfig>): State => ({
  ...state,
  appConfig: { ...state.appConfig, ...updatedConfig },
  appConfigSerial: state.appConfigSerial + 1,
});

const updateConfigRemote = (state: State, updatedConfig?: Partial<GQL<AppConfig>> | null): State =>
  updatedConfig
    ? {
        ...state,
        appConfig: {
          ...state.appConfig,
          birthDate: updatedConfig.birthDate ?? state.appConfig.birthDate,
          realTimePrices: updatedConfig.realTimePrices ?? state.appConfig.realTimePrices,
          fundMode: updatedConfig.fundMode ?? state.appConfig.fundMode,
          historyOptions: {
            period: updatedConfig.fundPeriod ?? state.appConfig.historyOptions.period,
            length:
              typeof updatedConfig.fundLength === 'undefined'
                ? state.appConfig.historyOptions.length
                : updatedConfig.fundLength ?? null,
          },
        },
      }
    : state;

const updateConfigLocal = (state: State, updatedConfig: Partial<LocalAppConfig>): State => ({
  ...state,
  appConfig: {
    ...state.appConfig,
    ...updatedConfig,
    birthDate: isValidDate(new Date(updatedConfig.birthDate ?? state.appConfig.birthDate))
      ? updatedConfig.birthDate ?? state.appConfig.birthDate
      : state.appConfig.birthDate,
  },
  appConfigSerial: state.appConfigSerial + 1,
});

export default function api(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.ConfigUpdatedFromApi:
      return updateConfigRemote(state, action.config);
    case ActionTypeApi.DataRead:
      return updateConfigRemote(state, action.res.config);
    case ActionTypeApi.ConfigUpdatedFromLocal:
      return updateConfigLocal(state, action.config);
    case ActionTypeApi.Loading:
      return { ...state, loading: state.loading + 1 };
    case ActionTypeApi.Loaded:
      return { ...state, loading: Math.max(0, state.loading - 1) };
    case ActionTypeApi.SettingsOpenToggled:
      return { ...state, settingsOpen: action.open ?? !state.settingsOpen };

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
