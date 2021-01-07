import { startOfMonth } from 'date-fns';
import { format } from 'date-fns-tz';
import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import config from '~api/config';

const formatMonth = (date: Date): string =>
  format(date, 'yyyy-MM-dd', { timeZone: config.timeZone });

const formatMonthStart = (month: Date): string => formatMonth(startOfMonth(month));

export const getEndOfMonthUnion = (monthEnds: Date[]): TaggedTemplateLiteralInvocationType =>
  sql`
  SELECT ${sql.join(
    [
      sql`${formatMonth(monthEnds[0])}::date AS month_date`,
      ...monthEnds.slice(1).map((date) => sql`${formatMonth(date)}::date`),
    ],
    sql` UNION SELECT `,
  )}
  `;

export const getMonthRangeUnion = (monthEnds: Date[]): TaggedTemplateLiteralInvocationType =>
  sql`
  SELECT ${sql.join(
    [
      sql`${formatMonthStart(monthEnds[0])}::date AS start_date, ${formatMonth(
        monthEnds[0],
      )}::date AS end_date`,
      ...monthEnds
        .slice(1)
        .map((date) =>
          sql.join(
            [sql`${formatMonthStart(date)}::date`, sql`${formatMonth(date)}::date`],
            sql`, `,
          ),
        ),
    ],
    sql` UNION SELECT `,
  )}
  `;
