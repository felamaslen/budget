import {
  sql,
  DatabaseTransactionConnectionType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';

import type { JoinedEntryRow, OldNetWorthRow } from '~api/types';

const joinEntryRows = (
  conditions: TaggedTemplateLiteralInvocationType = sql``,
): TaggedTemplateLiteralInvocationType<JoinedEntryRow> =>
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
      sql`nws.is_saye`,

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
  LEFT JOIN net_worth_subcategories nws ON nws.id = nwv.subcategory
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
      sql`nws.is_saye`,
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

const valueSimpleFxSaye = sql.join(
  [
    sql`COALESCE(v.value_simple, 0)`,
    sql`COALESCE(v.value_fx * v.fx_rate * 100, 0)::integer`,
    sql`COALESCE(
      CASE WHEN v.is_saye THEN v.value_op_vested * v.value_op_strike_price ELSE 0 END,
      0
    )::integer`,
  ],
  sql` + `,
);

export async function selectOldNetWorth(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
  oldDateEnd: string,
): Promise<readonly OldNetWorthRow[]> {
  const result = await db.query<OldNetWorthRow>(sql`
    WITH ${sql.join(
      [
        sql`values AS (
          SELECT ${sql.join(
            [
              sql`nw.id`,
              sql`nw.date`,
              sql`nwv.value AS value_simple`,
              sql`nwcat.category`,
              sql`nwsc.is_saye`,
              sql`nwfx.value AS value_fx`,
              sql`nwfx.currency AS value_fx_currency`,
              sql`nwop.vested AS value_op_vested`,
              sql`nwop.strike_price AS value_op_strike_price`,
              sql`nwop.market_price AS value_op_market_price`,
              sql`nwc.rate AS fx_rate`,
            ],
            sql`, `,
          )}
          FROM net_worth nw
          LEFT JOIN net_worth_values nwv ON nwv.net_worth_id = nw.id
          LEFT JOIN net_worth_subcategories nwsc ON nwsc.id = nwv.subcategory
          LEFT JOIN net_worth_categories nwcat ON nwcat.id = nwsc.category_id
          LEFT JOIN net_worth_fx_values nwfx ON nwfx.values_id = nwv.id
          LEFT JOIN net_worth_option_values nwop ON nwop.values_id = nwv.id
          LEFT JOIN net_worth_currencies nwc
            ON nwc.net_worth_id = nw.id
            AND nwc.currency = nwfx.currency
          WHERE ${sql.join(
            [
              sql`nw.uid = ${uid}`,
              sql`nw.date < ${oldDateEnd}`,
              sql`nw.date >= ${startDate}`,
              sql`(nwv.skip = FALSE OR nwv.skip IS NULL)`,
            ],
            sql` AND `,
          )}
        )`,

        sql`values_net_worth AS (
          SELECT
            v.id
            ,SUM(CASE WHEN v.category = ${'Pension'} THEN 0 ELSE ${valueSimpleFxSaye} END) AS value
          FROM values v
          GROUP BY v.id
        )`,

        sql`values_pension AS (
          SELECT
            v.id
            ,SUM(CASE WHEN v.category = ${'Pension'} THEN ${valueSimpleFxSaye} ELSE 0 END) AS value
          FROM values v
          GROUP BY v.id
        )`,

        sql`values_options AS (
          SELECT
            v.id
            ,SUM(
              COALESCE(v.value_op_vested *
                GREATEST(0, v.value_op_market_price - v.value_op_strike_price)
              )
            )::integer AS value
          FROM values v
          GROUP BY v.id
        )`,

        sql`values_home_equity AS (
          SELECT
            v.id
            ,SUM(
              CASE WHEN v.category IN (${'Mortgage'}, ${'House'})
              THEN COALESCE(v.value_simple, 0)
              ELSE 0
              END
            ) AS value
          FROM values v
          GROUP BY v.id
        )`,

        sql`values_locked_cash AS (
          SELECT
            v.id
            ,SUM(CASE WHEN v.category = ${'Cash (other)'} THEN ${valueSimpleFxSaye} ELSE 0 END) AS value
          FROM values v
          GROUP BY v.id
        )`,
      ],
      sql`, `,
    )}

    SELECT ${sql.join(
      [
        sql`v.date`,
        sql`values_net_worth.value AS net_worth`,
        sql`values_pension.value AS pension`,
        sql`values_options.value AS options`,
        sql`values_home_equity.value AS home_equity`,
        sql`values_locked_cash.value AS locked_cash`,
      ],
      sql`, `,
    )}
    FROM (SELECT distinct id, date FROM values) v
    LEFT JOIN values_net_worth ON values_net_worth.id = v.id
    LEFT JOIN values_pension ON values_pension.id = v.id
    LEFT JOIN values_options ON values_options.id = v.id
    LEFT JOIN values_home_equity ON values_home_equity.id = v.id
    LEFT JOIN values_locked_cash ON values_locked_cash.id = v.id
    ORDER BY v.date DESC
  `);
  return result.rows;
}
