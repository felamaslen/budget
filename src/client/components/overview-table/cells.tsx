/** @jsx jsx */
import { jsx } from '@emotion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as Styled from './styles';
import HoverCost from '~client/components/hover-cost';
import { isMonthlyCategory, OverviewPreview } from '~client/components/overview-preview';
import type { OverviewTableRow, OverviewTableColumn } from '~client/types';

type Props = {
  row: OverviewTableRow;
  columns: OverviewTableColumn[];
};

type PropsCell = Styled.PropsCell & Pick<OverviewTableRow, 'year' | 'month'>;

const Cell: React.FC<PropsCell> = ({ year, month, cellColor, children, ...props }) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const timer = useRef<number>(0);
  const onHover = useCallback(() => {
    timer.current = window.setTimeout(() => setShowPreview(true), 100);
  }, []);

  const onBlur = useCallback(() => {
    clearTimeout(timer.current);
    setShowPreview(false);
  }, []);

  useEffect(() => (): void => clearTimeout(timer.current), []);

  return (
    <Styled.Cell
      style={{ backgroundColor: cellColor ?? undefined }}
      {...props}
      onFocus={onHover}
      onBlur={onBlur}
    >
      {children}
      {showPreview && isMonthlyCategory(props.column) && (
        <OverviewPreview category={props.column} year={year} month={month} />
      )}
    </Styled.Cell>
  );
};

export const OverviewTableCells: React.FC<Props> = ({
  columns,
  row: { year, month, monthText, cells, past, active, future },
}) => (
  <Styled.Row past={past} active={active} future={future}>
    <Styled.Cell key="month" column="month" past={past} active={active} future={future}>
      {monthText}
    </Styled.Cell>
    {columns.map(([column]) => (
      <Cell
        key={column}
        year={year}
        month={month}
        column={column}
        cellColor={cells[column].rgb}
        past={past}
        active={active}
        future={future}
      >
        <HoverCost value={cells[column].value} />
      </Cell>
    ))}
  </Styled.Row>
);
