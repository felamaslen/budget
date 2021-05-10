import { DatabaseTransactionConnectionType, sql } from 'slonik';
import config from '~api/config';
import { AnalysisPage, BucketInput } from '~api/types';

export type BucketWithCurrentValueRow = {
  id: number;
  page: AnalysisPage;
  filter_category: string | null;
  value: number;
  value_actual: number;
};

export async function selectBucketsWithCurrentValue(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: AnalysisPage,
  startDate: string,
  endDate: string,
): Promise<readonly BucketWithCurrentValueRow[]> {
  const { rows } = await db.query<BucketWithCurrentValueRow>(sql`
  WITH ${sql.join(
    [
      sql`page_items AS (
      SELECT t.id, t.category, t.cost FROM ${sql.identifier([page])} t
      WHERE ${sql.join(
        [
          sql`t.uid = ${uid}`,
          sql`t.date BETWEEN ${startDate} AND ${endDate}`,
          page === AnalysisPage.General &&
            sql`t.category != ALL(${sql.array(
              config.data.overview.investmentPurchaseCategories,
              'text',
            )})`,
        ].filter(Boolean),
        sql` AND `,
      )}
      )`,
      sql`page_buckets AS (
        SELECT * FROM (
          SELECT id, uid, page, filter_category, value
          FROM buckets b
          WHERE ${sql.join(
            [sql`b.uid = ${uid}`, sql`b.page = ${page}`, sql`b.filter_category IS NOT NULL`],
            sql` AND `,
          )}
        ) b_defined_category
        UNION SELECT * FROM (
          SELECT ${sql.join(
            [
              sql`COALESCE(b.id, 0)::int4 as id`,
              sql`${uid}::int4 as uid`,
              sql`r.page`,
              sql`NULL as filter_category`,
              sql`COALESCE(b.value, 0)::int4 as value`,
            ],
            sql`, `,
          )}
          FROM (SELECT ${page}::page_category AS page) r
          LEFT JOIN buckets b ON b.uid = ${uid} AND b.page = r.page AND b.filter_category IS NULL
        ) b_null_category
      )`,
      sql`bucket_filtered_value AS (
        SELECT COALESCE(SUM(t.cost), 0)::int4 AS value
        FROM page_items t
        INNER JOIN page_buckets b ON b.filter_category = t.category
      )`,
      sql`bucket_rows AS (
        SELECT ${sql.join(
          [
            sql`b.id`,
            sql`row_number() OVER (PARTITION BY b.id) AS row_num`,
            sql`b.page`,
            sql`b.filter_category`,
            sql`b.value`,
            sql`COALESCE(
            SUM(
              CASE
                WHEN (
                  b.filter_category IS NULL OR
                  (b.filter_category IS NOT NULL AND t.category = b.filter_category)
                ) THEN t.cost
                ELSE 0
              END
            ) OVER (PARTITION BY b.id) -
            CASE
              WHEN b.filter_category IS NULL THEN COALESCE(bf.value, 0)
              ELSE 0
            END,
            0
          )::int4 AS value_actual`,
          ],
          sql`, `,
        )}
        FROM page_buckets b
        LEFT JOIN bucket_filtered_value bf ON 1=1
        LEFT JOIN page_items t ON 1=1
      )
      `,
    ],
    sql`, `,
  )}
  SELECT id, page, filter_category, value, value_actual FROM bucket_rows
  WHERE row_num = 1
  `);
  return rows;
}

export async function insertBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  bucket: BucketInput,
): Promise<void> {
  await db.query(sql`
  INSERT INTO buckets (uid, page, filter_category, value)
  VALUES (${uid}, ${bucket.page}, ${bucket.filterCategory ?? null}, ${bucket.value})
  `);
}

export async function updateBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  bucket: BucketInput,
): Promise<void> {
  await db.query(sql`
  UPDATE buckets SET page = ${bucket.page}, filter_category = ${
    bucket.filterCategory ?? null
  }, value = ${bucket.value}
  WHERE uid = ${uid} AND id = ${id}
  `);
}

export async function selectInvestmentBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<number | undefined> {
  const { rows } = await db.query<{ value: number }>(sql`
  SELECT value FROM bucket_investment
  WHERE uid = ${uid}
  `);
  return rows[0]?.value;
}

export async function upsertInvestmentBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  value: number,
): Promise<number> {
  const { rows } = await db.query<{ value: number }>(sql`
  INSERT INTO bucket_investment (uid, value) VALUES (${uid}, ${value})
  ON CONFLICT (uid) DO UPDATE SET value = excluded.value
  RETURNING value
  `);
  return rows[0].value;
}
