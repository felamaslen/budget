/** @jsx jsx */
import { jsx } from '@emotion/react';
import addDays from 'date-fns/addDays';
import endOfMonth from 'date-fns/endOfMonth';
import getUnixTime from 'date-fns/getUnixTime';
import startOfDay from 'date-fns/startOfDay';
import { useCallback, useMemo } from 'react';

import * as Styled from './styles';
import { LineGraph, TimeAxes } from '~client/components/graph';
import type { PropsCell } from '~client/components/overview-table/styles';
import { useOverviewPreviewQuery } from '~client/hooks/gql';
import { toISO } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { DrawProps, Line, Point, Range } from '~client/types';
import { MonthlyCategory } from '~client/types/enum';

export const isMonthlyCategory = (
  category: PropsCell['column'] | MonthlyCategory,
): category is MonthlyCategory =>
  (Object.values(MonthlyCategory) as string[]).includes(category as string);

type Props = {
  category: MonthlyCategory;
  year: number;
  month: number;
};

function getRanges(startDate: Date, line: Line): Range {
  const minY = line.data.reduce<number>((last, [, value]) => Math.min(last, value), Infinity);
  const maxY = line.data.reduce<number>((last, [, value]) => Math.max(last, value), -Infinity);

  const minX = getUnixTime(startDate);
  const maxX = getUnixTime(startOfDay(endOfMonth(startDate)));

  return { minX, maxX, minY, maxY };
}

export const OverviewPreview: React.FC<Props> = ({ category, year, month }) => {
  const [{ data }] = useOverviewPreviewQuery({
    variables: { category, date: toISO(new Date(year, month - 1)) },
  });

  const startDate = useMemo(() => new Date(data?.overviewPreview?.startDate ?? new Date()), [data]);

  const lines = useMemo<Line[]>(
    () => [
      {
        key: `overview-preview-${category}-${startDate.toISOString()}`,
        name: 'Overview preview',
        data: (data?.overviewPreview?.values ?? []).map<Point>((value, index) => [
          getUnixTime(addDays(startDate, index)),
          value,
        ]),
        color: colors.black,
        smooth: false,
        strokeWidth: 2,
      },
    ],
    [data, category, startDate],
  );

  const ranges = useMemo<Range>(() => getRanges(startDate, lines[0]), [lines, startDate]);

  const BeforeLines = useCallback<React.FC<DrawProps>>((props) => <TimeAxes {...props} />, []);

  if (ranges.minY === ranges.maxY || ranges.maxY < 0) {
    return null;
  }
  return (
    <Styled.Preview>
      <LineGraph
        lines={lines}
        {...ranges}
        width={Styled.width}
        height={Styled.height}
        BeforeLines={BeforeLines}
      />
    </Styled.Preview>
  );
};
