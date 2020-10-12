import { getAllData } from '~api/controllers';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { allQuerySchema } from '~api/schema/all';
import { FundsParams } from '~api/types';

export const routeGet = validatedAuthDbRoute<
  void,
  void,
  {
    limit: number;
    period: FundsParams['period'];
    length: number;
    history: boolean;
  }
>(
  {
    query: allQuerySchema,
  },
  async (db, req, res, _, __, query) => {
    const data = await getAllData(
      db,
      req.user.uid,
      query.limit,
      query.history,
      query.period,
      query.length,
      new Date(),
    );
    res.json({ data });
  },
);
