import { sql, DatabaseTransactionConnectionType } from 'slonik';

export type PivotTableRow = { thing: string; year: number; cost: number };

export type PivotColumn = 'item' | 'category' | 'holiday' | 'society';

export async function selectPivotTable(
  db: DatabaseTransactionConnectionType,
  table: string,
  thing: PivotColumn,
  year?: number,
): Promise<readonly PivotTableRow[]> {
  const { rows } = await db.query<PivotTableRow>(sql`
  SELECT L.thing, L.year, SUM(cost) AS cost
  FROM (
    SELECT ${sql.join(
      [sql`${sql.identifier([thing])} AS thing`, sql`date_part('year', date) AS year`, sql`cost`],
      sql`, `,
    )}
    FROM ${sql.identifier([table])}
    WHERE ${year ? sql`year = ${year}` : sql`1=1`}
  ) L
  GROUP BY L.thing, L.year
  ORDER BY L.thing, L.year
  `);
  return rows;
}
