import type { GQL, GQLDeep } from '~client/types';
import type { AppConfig, InitialQuery } from '~client/types/gql';

export const enum ActionTypeApi {
  ConfigUpdated = '@@api/CONFIG_UPDATED',
  DataRead = '@@api/DATA_READ',
  Loading = '@@api/LOADING',
  Loaded = '@@api/LOADED',
}

export type ActionApiConfigUpdated = {
  type: ActionTypeApi.ConfigUpdated;
  config: Partial<GQL<AppConfig>>;
};

export const configUpdated = (
  config: ActionApiConfigUpdated['config'],
): ActionApiConfigUpdated => ({
  type: ActionTypeApi.ConfigUpdated,
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
  | ActionApiConfigUpdated
  | ActionApiDataRead
  | ActionApiLoading
  | ActionApiLoaded;
