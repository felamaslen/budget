import { sql, DatabaseTransactionConnectionType, SqlSqlTokenType, QueryResultType } from 'slonik';

import { JoinedEntryRow, OldNetWorthRow, OldHomeEquityRow } from '~api/types';

const joinEntryRows = (
  conditions: SqlSqlTokenType<QueryResultType<string>> = sql``,
): SqlSqlTokenType<JoinedEntryRow> =>
  sql`
  SELECT ${sql.join(
    [
      sql`entries_with_credit_limit.id`,
      sql`entries_with_credit_limit.date`,

      sql`entries_with_credit_limit.currency_ids`,
      sql`entries_with_credit_limit.currencies`,
      sql`entries_with_credit_limit.currency_rates`,

      sql`entries_with_credit_limit.credit_limit_subcategory`,
      sql`entries_with_credit_limit.credit_limit_value`,

      sql`nwv.id as value_id`,
      sql`nwv.subcategory as value_subcategory`,
      sql`nwv.skip as value_skip`,
      sql`nwv.value as value_simple`,

      sql`array_agg(nwfxv.value order by nwfxv.currency) as fx_values`,
      sql`array_agg(nwfxv.currency order by nwfxv.currency) as fx_currencies`,

      sql`nwopv.units as op_units`,
      sql`nwopv.strike_price as op_strike_price`,
      sql`nwopv.market_price as op_market_price`,
      sql`nwopv.vested as op_vested`,

      sql`nwmv.payments_remaining as mortgage_payments_remaining`,
      sql`nwmv.rate as mortgage_rate`,
    ],
    sql`, `,
  )}

  FROM (
    SELECT ${sql.join(
      [
        sql`entries_with_currencies.id`,
        sql`entries_with_currencies.date`,

        sql`entries_with_currencies.currency_ids`,
        sql`entries_with_currencies.currencies`,
        sql`entries_with_currencies.currency_rates`,

        sql`array_agg(nwcl.subcategory order by nwcl.subcategory) as credit_limit_subcategory`,
        sql`array_agg(nwcl.value order by nwcl.subcategory) as credit_limit_value`,
      ],
      sql`, `,
    )}

    FROM (
      SELECT ${sql.join(
        [
          sql`net_worth.id`,
          sql`net_worth.date`,

          sql`array_agg(nwc.id order by nwc.id) as currency_ids`,
          sql`array_agg(nwc.currency order by nwc.id) as currencies`,
          sql`array_agg(nwc.rate order by nwc.id) as currency_rates`,
        ],
        sql`, `,
      )}

      FROM net_worth
      LEFT JOIN net_worth_currencies nwc on nwc.net_worth_id = net_worth.id
      ${conditions}
      GROUP BY net_worth.id, net_worth.date

    ) entries_with_currencies

    LEFT JOIN net_worth_credit_limit nwcl on nwcl.net_worth_id = entries_with_currencies.id

    GROUP BY ${sql.join(
      [
        sql`entries_with_currencies.id`,
        sql`entries_with_currencies.date`,
        sql`entries_with_currencies.currencies`,
        sql`entries_with_currencies.currency_ids`,
        sql`entries_with_currencies.currency_rates`,
      ],
      sql`, `,
    )}
  ) entries_with_credit_limit

  LEFT JOIN net_worth_values nwv on nwv.net_worth_id = entries_with_credit_limit.id
  LEFT JOIN net_worth_fx_values nwfxv on nwfxv.values_id = nwv.id
  LEFT JOIN net_worth_option_values nwopv on nwopv.values_id = nwv.id
  LEFT JOIN net_worth_mortgage_values nwmv ON nwmv.values_id = nwv.id

  GROUP BY ${sql.join(
    [
      sql`entries_with_credit_limit.id`,
      sql`entries_with_credit_limit.date`,
      sql`entries_with_credit_limit.currency_ids`,
      sql`entries_with_credit_limit.currencies`,
      sql`entries_with_credit_limit.currency_rates`,
      sql`entries_with_credit_limit.credit_limit_subcategory`,
      sql`entries_with_credit_limit.credit_limit_value`,
      sql`nwv.id`,
      sql`nwv.subcategory`,
      sql`nwv.skip`,
      sql`nwv.value`,
      sql`nwopv.units`,
      sql`nwopv.strike_price`,
      sql`nwopv.market_price`,
      sql`nwopv.vested`,
      sql`nwmv.payments_remaining`,
      sql`nwmv.rate`,
    ],
    sql`, `,
  )}
`;

export async function selectEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
): Promise<readonly JoinedEntryRow[]> {
  const result = await db.query<JoinedEntryRow>(
    joinEntryRows(sql`
    WHERE ${sql.join([sql`net_worth.id = ${netWorthId}`, sql`uid = ${uid}`], sql` AND `)}
    `),
  );
  return result.rows;
}

export async function selectAllEntries(
  db: DatabaseTransactionConnectionType,
  uid: number,
  oldDateEnd: string,
): Promise<readonly JoinedEntryRow[]> {
  const result = await db.query<JoinedEntryRow>(
    joinEntryRows(
      sql`WHERE ${sql.join([sql`uid = ${uid}`, sql`date >= ${oldDateEnd}`], sql` AND `)}`,
    ),
  );
  return result.rows;
}

export async function selectOldNetWorth(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
  oldDateEnd: string,
): Promise<readonly OldNetWorthRow[]> {
  const result = await db.query<OldNetWorthRow>(sql`
    SELECT ${sql.join(
      [
        sql`(${sql.join(
          [
            sql`SUM(COALESCE(nwv.value, 0))`,
            sql`SUM(COALESCE(nwfx.value * nwc.rate * 100, 0))::integer`,
          ],
          sql` + `,
        )}) as value`,

        sql`SUM(COALESCE(nwop.units * nwop.market_price, 0))::integer as option_value`,
      ],
      sql`, `,
    )}
    FROM net_worth as nw
    LEFT JOIN net_worth_values as nwv ON nwv.net_worth_id = nw.id
    LEFT JOIN net_worth_fx_values as nwfx ON nwfx.values_id = nwv.id
    LEFT JOIN net_worth_option_values as nwop ON nwop.values_id = nwv.id
    LEFT JOIN net_worth_currencies as nwc
      ON nwc.net_worth_id = nw.id
      AND nwc.currency = nwfx.currency
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.date < ${oldDateEnd}`,
        sql`nw.date >= ${startDate}`,
        sql`(${sql.join([sql`nwv.skip = FALSE`, sql`nwv.skip IS NULL`], sql` OR `)})`,
      ],
      sql` AND `,
    )}
    GROUP BY nw.date
    ORDER BY nw.date
  `);
  return result.rows;
}

export async function selectOldHomeEquity(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
  oldDateEnd: string,
): Promise<readonly OldHomeEquityRow[]> {
  const result = await db.query<OldHomeEquityRow>(sql`
  SELECT
    ${sql.join(
      [
        sql`nw.date`,
        sql`SUM(
          CASE
            WHEN nwc.category IN ('Mortgage', 'House')
            THEN COALESCE(nwv.value, 0)
            ELSE 0
          END
        ) AS home_equity
        `,
      ],
      sql`, `,
    )}
  FROM net_worth as nw
  LEFT JOIN net_worth_values as nwv ON nwv.net_worth_id = nw.id
  LEFT JOIN net_worth_subcategories nws ON nws.id = nwv.subcategory
  LEFT JOIN net_worth_categories nwc ON nwc.id = nws.category_id
  WHERE ${sql.join(
    [sql`nw.uid = ${uid}`, sql`nw.date < ${oldDateEnd}`, sql`nw.date >= ${startDate}`],
    sql` AND `,
  )}
  GROUP BY nw.date
  ORDER BY nw.date
  `);
  return result.rows;
}
