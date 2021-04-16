import type { GQL, GQLDeep, LocalAppConfig } from '~client/types';
import type { AppConfig, InitialQuery } from '~client/types/gql';

export const enum ActionTypeApi {
  ConfigUpdatedFromApi = '@@api/CONFIG_UPDATED_FROM_API',
  ConfigUpdatedFromLocal = '@@api/CONFIG_UPDATED_FROM_LOCAL',
  DataRead = '@@api/DATA_READ',
  Loading = '@@api/LOADING',
  Loaded = '@@api/LOADED',
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
  res: GQLDeep<InitialQuery>;
};

export const dataRead = (res: GQLDeep<InitialQuery>): ActionApiDataRead => ({
  type: ActionTypeApi.DataRead,
  res,
});

export type ActionApiLoading = { type: ActionTypeApi.Loading };
export type ActionApiLoaded = { type: ActionTypeApi.Loaded };

export const apiLoading: ActionApiLoading = { type: ActionTypeApi.Loading };
export const apiLoaded: ActionApiLoaded = { type: ActionTypeApi.Loaded };

export type ActionApi =
  | ActionApiConfigUpdatedFromApi
  | ActionApiConfigUpdatedFromLocal
  | ActionApiDataRead
  | ActionApiLoading
  | ActionApiLoaded;
