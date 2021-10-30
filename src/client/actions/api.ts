import type { LocalAppConfig } from '~client/types';
import type { AppConfig, InitialQuery } from '~client/types/gql';
import type { GQL } from '~shared/types';

export const enum ActionTypeApi {
  ConfigUpdatedFromApi = '@@api/CONFIG_UPDATED_FROM_API',
  ConfigUpdatedFromLocal = '@@api/CONFIG_UPDATED_FROM_LOCAL',
  DataRead = '@@api/DATA_READ',
  Loading = '@@api/LOADING',
  Loaded = '@@api/LOADED',
  SettingsOpenToggled = '@@api/SETTINGS_OPEN_TOGGLED',
}

export type ActionApiConfigUpdatedFromApi = {
  type: ActionTypeApi.ConfigUpdatedFromApi;
  config: Partial<GQL<AppConfig>>;
};

export const configUpdatedFromApi = (
  config: Partial<GQL<AppConfig>>,
): ActionApiConfigUpdatedFromApi => ({
  type: ActionTypeApi.ConfigUpdatedFromApi,
  config,
});

export type ActionApiConfigUpdatedFromLocal = {
  type: ActionTypeApi.ConfigUpdatedFromLocal;
  config: Partial<LocalAppConfig>;
};

export const configUpdatedFromLocal = (
  config: Partial<LocalAppConfig>,
): ActionApiConfigUpdatedFromLocal => ({
  type: ActionTypeApi.ConfigUpdatedFromLocal,
  config,
});

export type ActionApiDataRead = {
  type: ActionTypeApi.DataRead;
  res: GQL<InitialQuery>;
};

export const dataRead = (res: InitialQuery): ActionApiDataRead => ({
  type: ActionTypeApi.DataRead,
  res,
});

export type ActionApiLoading = { type: ActionTypeApi.Loading };
export type ActionApiLoaded = { type: ActionTypeApi.Loaded };

export const apiLoading: ActionApiLoading = { type: ActionTypeApi.Loading };
export const apiLoaded: ActionApiLoaded = { type: ActionTypeApi.Loaded };

export type ActionSettingsToggled = {
  type: ActionTypeApi.SettingsOpenToggled;
  open: boolean | null;
};
export const settingsToggled = (open?: boolean): ActionSettingsToggled => ({
  type: ActionTypeApi.SettingsOpenToggled,
  open: open ?? null,
});

export type ActionApi =
  | ActionApiConfigUpdatedFromApi
  | ActionApiConfigUpdatedFromLocal
  | ActionApiDataRead
  | ActionApiLoading
  | ActionApiLoaded
  | ActionSettingsToggled;
