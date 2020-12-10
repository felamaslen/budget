import { InitialQuery } from '~client/types';

export const enum ActionTypeApi {
  DataRead = '@@api/DATA_READ',
}

export type ActionApiDataRead = {
  type: ActionTypeApi.DataRead;
  res: InitialQuery;
};

export const dataRead = (res: InitialQuery): ActionApiDataRead => ({
  type: ActionTypeApi.DataRead,
  res,
});

export type ActionApi = ActionApiDataRead;
