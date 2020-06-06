import { sql, DatabaseTransactionConnectionType } from 'slonik';
import { IPLog, IPLogRow } from '~api/types';

export async function getIpLog(
  db: DatabaseTransactionConnectionType,
  ip: string,
): Promise<IPLog | undefined> {
  const result = await db.query<IPLogRow>(sql`
  SELECT ${sql.identifier(['time'])}, ${sql.identifier(['count'])}
  FROM ip_login_req
  WHERE ip = ${ip}
  `);
  return result.rows.length
    ? { ...result.rows[0], time: new Date(result.rows[0].time) }
    : undefined;
}

export async function incrementIpLog(
  db: DatabaseTransactionConnectionType,
  ip: string,
  time: Date,
  updateTime: boolean,
): Promise<void> {
  await db.query(sql`
  INSERT INTO ip_login_req (ip, time, count)
  VALUES (${ip}, ${time.toISOString()}, 1)
  ON CONFLICT (ip) DO UPDATE
    SET ${sql.join(
      [
        sql`time = ${updateTime ? sql`excluded.time` : sql`ip_login_req.time`}`,
        sql`count = ip_login_req.count + 1`,
      ],
      sql`, `,
    )}
  `);
}

export async function removeIpLog(
  db: DatabaseTransactionConnectionType,
  ip: string,
): Promise<void> {
  await db.query(sql`
  DELETE FROM ip_login_req
  WHERE ip = ${ip}
  `);
}
