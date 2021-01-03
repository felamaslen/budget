import type { InitialQuery } from '~client/types/gql';

export const enum ActionTypeApi {
  DataRead = '@@api/DATA_READ',
  Loading = '@@api/LOADING',
  Loaded = '@@api/LOADED',
}

export type ActionApiDataRead = {
  type: ActionTypeApi.DataRead;
  res: InitialQuery;
};

export const dataRead = (res: InitialQuery): ActionApiDataRead => ({
  type: ActionTypeApi.DataRead,
  res,
});

export type ActionApiLoading = { type: ActionTypeApi.Loading };
export type ActionApiLoaded = { type: ActionTypeApi.Loaded };

export const apiLoading: ActionApiLoading = { type: ActionTypeApi.Loading };
export const apiLoaded: ActionApiLoaded = { type: ActionTypeApi.Loaded };

export type ActionApi = ActionApiDataRead | ActionApiLoading | ActionApiLoaded;
