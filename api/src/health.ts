import { Router } from 'express';
import { sql } from 'slonik';

import { withSlonik } from '~api/modules/db';
import logger from '~api/modules/logger';

let healthCheckPassed = false;

const checkReadiness = withSlonik(async (db) => {
  const healthCheck = await db.query<{ version: string }>(sql`select version()`);

  if (!healthCheck.rows.length) {
    throw new Error('output of select version() is empty');
  }
});

export function healthRoutes(): Router {
  const router = Router();

  router.get('/liveness', (_, res) => {
    res.json({ ok: true });
  });

  router.get('/readiness', async (_, res) => {
    try {
      if (!healthCheckPassed) {
        await checkReadiness();
        healthCheckPassed = true;
      }

      res.json({
        ok: true,
      });
    } catch (err) {
      logger.error('readiness check failed: %s', {
        err: err.message,
      });

      res.status(500);
      res.json({ ok: false });
    }
  });

  return router;
}
