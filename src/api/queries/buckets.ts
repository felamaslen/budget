import { DatabaseTransactionConnectionType, sql } from 'slonik';

import { standardListPages } from './list';
import config from '~api/config';
import { AnalysisPage, BucketInput, PageListStandard } from '~api/types';

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
  startDate: string,
  endDate: string,
): Promise<readonly BucketWithCurrentValueRow[]> {
  const { rows } = await db.query<BucketWithCurrentValueRow>(sql`
  WITH ${sql.join(
    [
      sql`page_items AS (
        SELECT page, id, category, value
        FROM list_standard
        WHERE ${sql.join(
          [
            sql`uid = ${uid}`,
            sql`date BETWEEN ${startDate} AND ${endDate}`,
            sql`NOT(page = ${AnalysisPage.General} AND category = ANY(${sql.array(
              config.data.overview.investmentPurchaseCategories,
              'text',
            )}))`,
          ],
          sql` AND `,
        )}
      )`,

      sql`page_buckets AS (
        SELECT * FROM (
          SELECT id, uid, page, filter_category, value
          FROM buckets
          WHERE uid = ${uid} AND filter_category IS NOT NULL
        ) buckets_defined_category

        UNION SELECT * FROM (
          SELECT ${sql.join(
            [
              sql`COALESCE(id, 0) AS id`,
              sql`${uid}::int4 AS uid`,
              sql`pages.page`,
              sql`NULL AS filter_category`,
              sql`COALESCE(value, 0) AS value`,
            ],
            sql`, `,
          )}
          FROM (
            ${sql.join(
              standardListPages.map((page) => sql`SELECT ${page}::page_category AS page`),
              sql` UNION `,
            )}
          ) pages
          LEFT JOIN buckets ON ${sql.join(
            [
              sql`buckets.uid = ${uid}`,
              sql`buckets.page = pages.page`,
              sql`buckets.filter_category IS NULL`,
            ],
            sql` AND `,
          )}
        ) buckets_null_category
      )
      `,

      sql`buckets_filtered_values AS (
        SELECT b.page, COALESCE(SUM(t.value), 0)::int4 AS value
        FROM page_buckets b
        LEFT JOIN page_items t ON t.page = b.page AND t.category = b.filter_category
        GROUP BY b.page
      )`,

      sql`bucket_rows AS (
        SELECT ${sql.join(
          [
            sql`b.id`,
            sql`row_number() OVER (PARTITION BY b.page, b.id) AS row_num`,
            sql`b.page`,
            sql`b.filter_category`,
            sql`b.value`,
            sql`COALESCE(
            SUM(
              CASE WHEN (b.filter_category IS NULL OR t.category = b.filter_category)
                THEN t.value
              ELSE 0 END
            ) OVER (PARTITION BY b.page, b.id) -
            CASE WHEN b.filter_category IS NULL THEN COALESCE(bf.value, 0)
            ELSE 0 END,
            0
          )::int4 AS value_actual`,
          ],
          sql`, `,
        )}
        FROM page_buckets b
        INNER JOIN buckets_filtered_values bf ON bf.page = b.page
        LEFT JOIN page_items t ON t.page = b.page
      )`,
    ],
    sql`, `,
  )}

  SELECT id, page, filter_category, value, value_actual
  FROM bucket_rows
  WHERE row_num = 1
  ORDER BY page, filter_category
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

export type InvestmentBucketRow = {
  expected_value: number;
  purchase_value: number;
};

export async function selectInvestmentBucket(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
  endDate: string,
): Promise<readonly InvestmentBucketRow[]> {
  const { rows } = await db.query<InvestmentBucketRow>(sql`
  SELECT COALESCE(expected_value, 0) AS expected_value, COALESCE(purchase_value, 0) AS purchase_value
  FROM (SELECT 1) r
  LEFT JOIN (
    SELECT COALESCE(SUM(value), 0)::int4 AS purchase_value
    FROM list_standard
    WHERE ${sql.join(
      [
        sql`uid = ${uid}`,
        sql`page = ${PageListStandard.General}`,
        sql`category = ANY(${sql.array(
          config.data.overview.investmentPurchaseCategories,
          'text',
        )})`,
        sql`date BETWEEN ${startDate} AND ${endDate}`,
      ],
      sql` AND `,
    )}
  ) p ON TRUE
  LEFT JOIN (
    SELECT bi.value AS expected_value
    FROM bucket_investment bi
    WHERE bi.uid = ${uid}
  ) b ON TRUE
  `);
  return rows;
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
