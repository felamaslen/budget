import { startOfMonth } from 'date-fns';
import { format } from 'date-fns-tz';
import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import config from '~api/config';

const toLocalISO = (date: Date): string =>
  format(date, 'yyyy-MM-dd', { timeZone: config.timeZone });

const formatMonthStart = (month: Date): string => toLocalISO(startOfMonth(month));

export const getEndOfMonthUnion = (
  monthEnds: Date[],
): TaggedTemplateLiteralInvocationType<{ month_date: string }[]> =>
  sql`
  SELECT ${sql.join(
    [
      sql`${toLocalISO(monthEnds[0])}::date AS month_date`,
      ...monthEnds.slice(1).map((date) => sql`${toLocalISO(date)}::date`),
    ],
    sql` UNION SELECT `,
  )}
  `;

export const getMonthRangeUnion = (
  monthEnds: Date[],
): TaggedTemplateLiteralInvocationType<{ start_date: string; end_date: string }[]> =>
  sql`
  SELECT ${sql.join(
    [
      sql`${formatMonthStart(monthEnds[0])}::date AS start_date, ${toLocalISO(
        monthEnds[0],
      )}::date AS end_date`,
      ...monthEnds
        .slice(1)
        .map((date) =>
          sql.join([sql`${formatMonthStart(date)}::date`, sql`${toLocalISO(date)}::date`], sql`, `),
        ),
    ],
    sql` UNION SELECT `,
  )}
  `;

export const getDateRangeUnion = (
  dayEnds: Date[],
): TaggedTemplateLiteralInvocationType<{ start_date: string; end_date: string }[]> =>
  sql`
  SELECT ${sql.join(
    [
      sql`${toLocalISO(dayEnds[0])}::date AS start_date, ${toLocalISO(
        dayEnds[1],
      )}::date AS end_date`,
      ...dayEnds
        .slice(1)
        .map((date) =>
          sql.join([sql`${toLocalISO(date)}::date`, sql`${toLocalISO(date)}::date`], sql`, `),
        ),
    ],
    sql` UNION SELECT `,
  )}
  `;
