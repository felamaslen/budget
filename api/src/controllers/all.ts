import { DatabaseTransactionConnectionType } from 'slonik';

import { getFundsData } from './funds';
import { readListData } from './list';
import { getOverviewData } from './overview';
import config from '~api/config';
import {
  Page,
  OverviewResponse,
  FundsResponse,
  ListResponse,
  Income,
  Bill,
  Food,
  General,
  Holiday,
  Social,
  FundsParams,
} from '~api/types';

type AllResponse = {
  [Page.overview]: OverviewResponse;
  [Page.funds]: FundsResponse;
  [Page.income]: ListResponse<Income>;
  [Page.bills]: ListResponse<Bill>;
  [Page.food]: ListResponse<Food>;
  [Page.general]: ListResponse<General>;
  [Page.holiday]: ListResponse<Holiday>;
  [Page.social]: ListResponse<Social>;
};

export async function getAllData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  listLimit: number,
  fundsHistory: boolean,
  fundsPeriod: FundsParams['period'],
  fundsLength: number,
  now: Date = new Date(),
): Promise<AllResponse> {
  const [dataOverview, dataFunds, dataList] = await Promise.all([
    getOverviewData(db, uid, now),
    getFundsData(
      db,
      uid,
      {
        history: fundsHistory,
        period: fundsPeriod,
        length: fundsLength,
      },
      now,
    ),
    Promise.all(
      config.data.listCategories.map((category) => readListData(db, uid, category, listLimit)),
    ),
  ]);

  return dataList.reduce<AllResponse>(
    (last, data, index) => ({
      ...last,
      [config.data.listCategories[index]]: data,
    }),
    {
      [Page.overview]: dataOverview,
      [Page.funds]: dataFunds,
    } as AllResponse,
  );
}
