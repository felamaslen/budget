import { routeGet as routeGetBills } from '../bills';
import { routeGet as routeGetFood } from '../food';
import { routeGet as routeGetFunds } from '../funds';
import { routeGet as routeGetGeneral } from '../general';
import { routeGet as routeGetHoliday } from '../holiday';
import { routeGet as routeGetIncome } from '../income';
import { routeGet as routeGetSocial } from '../social';

import config from '~api/config';
import { getOverviewData } from '~api/controllers/overview';
import { authDbRoute } from '~api/middleware/request';
import knex from '~api/modules/db';
import ResponseMultiple from '~api/responseMultiple';
import { Page } from '~api/types';

const routeGetCategory = {
  [Page.funds]: routeGetFunds,
  [Page.income]: routeGetIncome,
  [Page.bills]: routeGetBills,
  [Page.food]: routeGetFood,
  [Page.general]: routeGetGeneral,
  [Page.social]: routeGetSocial,
  [Page.holiday]: routeGetHoliday,
};

export const routeGet = authDbRoute(async (db, req, res) => {
  const responses = config.data.listCategories.map(() => new ResponseMultiple());

  const dataOverview = await getOverviewData(db, req.user);

  await Promise.all(
    config.data.listCategories.map((category, key) =>
      routeGetCategory[category](config, knex)(req, responses[key]),
    ),
  );

  const data = responses.reduce<{ [page in Page]?: object }>(
    (items, result, index) => ({
      ...items,
      [config.data.listCategories[index]]: result.result.data,
    }),
    {
      [Page.overview]: dataOverview,
    },
  );

  res.json({ data });
});
