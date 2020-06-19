import config from '~api/config';
import { getAllData } from '~api/controllers';
import { authDbRoute } from '~api/middleware/request';

export const routeGet = authDbRoute(async (db, req, res) => {
  const data = await getAllData(
    db,
    req.user.uid,
    Number(req.query.limit) || config.data.listPageLimit,
    new Date(),
  );
  res.json({ data });
});
