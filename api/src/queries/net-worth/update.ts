import { sql, DatabaseTransactionConnectionType } from 'slonik';

export async function updateEntryDate(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  date: string,
): Promise<void> {
  await db.query(sql`
    UPDATE net_worth
    SET date = ${date}
    WHERE uid=${uid} AND id = ${netWorthId}
  `);
}
