import { sql, DatabaseTransactionConnectionType } from 'slonik';

export async function updateEntryDate(
  db: DatabaseTransactionConnectionType,
  uid: string,
  netWorthId: string,
  date: string,
): Promise<void> {
  await db.query(sql`
    UPDATE net_worth
    SET date = ${date}
    WHERE uid=${uid} AND id = ${netWorthId}
  `);
}
