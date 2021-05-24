import { sql, DatabaseTransactionConnectionType } from 'slonik';

import type { PageListCost } from '~api/types';

export type PivotTableRow = { thing: string; year: number; cost: number };

export type PivotColumn = 'item' | 'category';

export async function selectPivotTable(
  db: DatabaseTransactionConnectionType,
  page: PageListCost,
  thing: PivotColumn,
  year?: number,
): Promise<readonly PivotTableRow[]> {
  const { rows } = await db.query<PivotTableRow>(sql`
  SELECT L.thing, L.year, SUM(value) AS cost
  FROM (
    SELECT ${sql.join(
      [sql`${sql.identifier([thing])} AS thing`, sql`date_part('year', date) AS year`, sql`cost`],
      sql`, `,
    )}
    FROM list_standard
    WHERE page = ${page} ${year ? sql`AND year = ${year}` : sql``}
  ) L
  GROUP BY L.thing, L.year
  ORDER BY L.thing, L.year
  `);
  return rows;
}
