import React, { useCallback } from 'react';

import { LoansGraphLabel } from './labels';
import { graphHeight, graphHeightMobile } from './styles';
import type { LoanWithInfo } from './types';
import { LineGraph, LineGraphProps, TimeAxes, useGraphWidth } from '~client/components/graph';
import { useIsMobile } from '~client/hooks';
import { DrawProps, Line, Point } from '~client/types';

export type Props = {
  loans: LoanWithInfo[];
};

export const LoansGraph: React.FC<Props> = ({ loans }) => {
  const visibleLoans = loans.filter(({ visible }) => visible);
  const lines = visibleLoans.reduce<Line[]>((last, { line, originalData }) => {
    if (!originalData) {
      return [...last, line];
    }
    return [
      ...last,
      { ...line, name: `${line.name} (Modified)`, dashed: true },
      {
        ...line,
        key: `${line.key}-original`,
        name: `${line.name} (Original)`,
        data: originalData.map<Point>((value, index) => [line.data[index][0], value]),
      },
    ];
  }, []);

  const minX = lines.reduce<number>((last, line) => Math.min(last, line.data[0][0]), Infinity);
  const maxX =
    lines.reduce<number>(
      (last, line) => Math.max(last, line.data[line.data.length - 1]?.[0] ?? 0),
      0,
    ) +
    86400 * 365;

  const maxY = lines.reduce<number>(
    (last, line) => line.data.reduce<number>((max, [, y]) => Math.max(max, y), last),
    0,
  );

  const BeforeLines = useCallback<React.FC<DrawProps>>((props) => <TimeAxes {...props} />, []);

  const isMobile = useIsMobile();
  const width = useGraphWidth(500);

  const graphProps: LineGraphProps = {
    BeforeLines,
    hoverEffect: { Label: LoansGraphLabel },
    lines,
    maxY,
    minY: 0,
    maxX,
    minX,
    height: isMobile ? graphHeightMobile : graphHeight,
    width,
  };

  if (!maxY) {
    return null;
  }

  return <LineGraph {...graphProps} />;
};
