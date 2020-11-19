import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import { checkLoggedIn, genToken, LoginResponse } from '~api/modules/auth';
import { getPool } from '~api/modules/db';
import { getIpLog, removeIpLog, incrementIpLog } from '~api/queries/user';
import { IPLog } from '~api/types';

const nullIpLog = (now: Date): IPLog => ({ time: now, count: 0 });

const banExpired = (now: Date, ipLog: IPLog = nullIpLog(now)): boolean =>
  now.getTime() - ipLog.time.getTime() > config.user.banTime;

const isBanned = (now: Date, ipLog: IPLog = nullIpLog(now)): boolean =>
  !banExpired(now, ipLog) && ipLog.count >= config.user.banTries;

const badLoginsForgiven = (now: Date, ipLog: IPLog): boolean =>
  now.getTime() - ipLog.time.getTime() > config.user.banLimit;

async function loginBanCheck(
  db: DatabaseTransactionConnectionType,
  now: Date,
  ip: string,
  log: IPLog = nullIpLog(now),
  loggedIn: boolean,
): Promise<void> {
  const shouldBan = !loggedIn && log.count >= config.user.banTries - 1;
  const shouldRemoveLog = loggedIn || badLoginsForgiven(now, log);

  if (shouldRemoveLog) {
    await removeIpLog(db, ip);
  } else if (shouldBan) {
    await incrementIpLog(db, ip, now, true);
  } else {
    await incrementIpLog(db, ip, now, false);
  }
}

export const attemptLogin = async (
  ip: string,
  pin: number,
  now = new Date(),
  databaseName?: string,
): Promise<LoginResponse | undefined> => {
  const result = await getPool(databaseName).transaction(
    async (
      db,
    ): Promise<{
      response?: LoginResponse;
      error?: Error;
    }> => {
      const ipLog = await getIpLog(db, ip);
      if (isBanned(now, ipLog)) {
        throw boom.unauthorized(config.msg.errorIpBanned);
      }

      let response: LoginResponse | undefined;
      let error: Error | undefined;

      try {
        const { name, uid } = await checkLoggedIn(db, pin);
        response = { name, ...genToken({ uid }) };
      } catch (err) {
        if (boom.isBoom(err) && err.output.statusCode === 401) {
          error = err;
        } else {
          throw err;
        }
      }

      await loginBanCheck(db, now, ip, ipLog, !error);
      return { error, response };
    },
  );

  if (result.error) {
    // If this error is thrown inside the transaction, the whole transaction will be rolled back
    throw result.error;
  }

  return result.response;
};
