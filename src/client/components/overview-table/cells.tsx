/** @jsx jsx */
import { jsx } from '@emotion/react';
import { useCallback } from 'react';

import * as Styled from './styles';
import HoverCost from '~client/components/hover-cost';
import { Query as PreviewQuery } from '~client/components/overview-preview';
import { isStandardListPage } from '~client/constants/data';
import type { OverviewTableRow, OverviewTableColumn } from '~client/types';

type Props = {
  row: OverviewTableRow;
  columns: OverviewTableColumn[];
  setPreviewQuery: (query: React.SetStateAction<PreviewQuery | null>) => void;
};

type PropsCell = Styled.PropsCell &
  Pick<Props, 'setPreviewQuery'> &
  Pick<OverviewTableRow, 'year' | 'month'>;

const Cell: React.FC<PropsCell> = ({ setPreviewQuery, year, month, cellColor, ...props }) => {
  const onHover = useCallback(() => {
    setPreviewQuery((last) => {
      if (!isStandardListPage(props.column)) {
        return null;
      }
      return last?.year === year && last?.month === month && last?.category === props.column
        ? last
        : { year, month, category: props.column };
    });
  }, [setPreviewQuery, year, month, props.column]);

  const onBlur = useCallback(() => {
    setPreviewQuery(null);
  }, [setPreviewQuery]);

  return (
    <Styled.Cell
      style={{ backgroundColor: cellColor ?? undefined }}
      {...props}
      onMouseOver={onHover}
      onFocus={onHover}
      onMouseMove={onHover}
      onMouseLeave={onBlur}
      onBlur={onBlur}
    />
  );
};

export const OverviewTableCells: React.FC<Props> = ({
  columns,
  row: { year, month, monthText, cells, past, active, future },
  setPreviewQuery,
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
        setPreviewQuery={setPreviewQuery}
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
