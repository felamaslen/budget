import React, { memo, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { OverviewTableCells as Cells } from './cells';
import * as Styled from './styles';
import { OverviewPreview, Query as PreviewQuery } from '~client/components/overview-preview';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { useMediaQuery, TodayContext } from '~client/hooks';
import { getOverviewTable } from '~client/selectors';
import { breakpointBase } from '~client/styled/mixins';
import { ButtonAdd } from '~client/styled/shared';
import { breakpoints } from '~client/styled/variables';
import {
  OverviewTable as OverviewTableRows,
  OverviewHeader,
  OverviewTableColumn,
  Page,
} from '~client/types';

type ColumnsProps = { columns: OverviewTableColumn[] };

const columnsMobile: OverviewHeader[] = [Page.income, 'spending', 'netWorthCombined'];

const columnsRestricted: OverviewHeader[] = [Page.income, 'spending', 'net', 'netWorthCombined'];

const columnsFull: OverviewHeader[] = [
  Page.funds,
  Page.bills,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
  Page.income,
  'spending',
  'net',
  'netWorthCombined',
];

const filterColumns = (columns: OverviewHeader[]): OverviewTableColumn[] =>
  OVERVIEW_COLUMNS.filter(([column]) => columns.includes(column));

const tableColumnsMobile = filterColumns(columnsMobile);
const tableColumnsRestricted = filterColumns(columnsRestricted);
const tableColumnsFull = filterColumns(columnsFull);

function getTableColumns(isMobile: boolean, isLarge: boolean): OverviewTableColumn[] {
  if (isMobile) {
    return tableColumnsMobile;
  }
  return isLarge ? tableColumnsFull : tableColumnsRestricted;
}

type Props = {
  addReceipt: () => void;
};

const Header: React.FC<Props & ColumnsProps> = ({ columns, addReceipt }) => (
  <Styled.Header>
    <Styled.HeaderLink column="month" key="month">
      <Styled.HeaderText>Month</Styled.HeaderText>
      <ButtonAdd onClick={addReceipt}>+</ButtonAdd>
    </Styled.HeaderLink>
    {columns.map(([column, { name, link }]) => (
      <Styled.HeaderLink column={column} key={name}>
        {link && (
          <Styled.HeaderText as={NavLink} {...link}>
            {name}
          </Styled.HeaderText>
        )}
        {!link && <Styled.HeaderText>{name}</Styled.HeaderText>}
      </Styled.HeaderLink>
    ))}
  </Styled.Header>
);

type PropsRows = ColumnsProps & {
  isMobile: boolean;
  rows: OverviewTableRows;
  setPreviewQuery: (query: React.SetStateAction<PreviewQuery | null>) => void;
};

const Rows: React.FC<PropsRows> = ({ isMobile, columns, rows, setPreviewQuery }) => (
  <Styled.Rows>
    {rows.slice(isMobile ? -19 : 0).map((row) => (
      <Cells key={row.monthText} columns={columns} row={row} setPreviewQuery={setPreviewQuery} />
    ))}
  </Styled.Rows>
);
const RowsMemo = memo(Rows);

export const OverviewTable: React.FC<Props> = ({ addReceipt }) => {
  const today = useContext(TodayContext);
  const rows = useSelector(getOverviewTable(today));

  const isTablet = useMediaQuery(breakpointBase(breakpoints.mobile));
  const isLargeTablet = useMediaQuery(breakpointBase(breakpoints.tabletSmall));
  const isDesktop = useMediaQuery(breakpointBase(breakpoints.tablet));
  const isLargeDesktop = useMediaQuery(breakpointBase(breakpoints.desktop));

  const isMobile = !isTablet;
  const isLarge = (!isDesktop && isLargeTablet) || isLargeDesktop;

  const tableColumns = getTableColumns(isMobile, isLarge);

  const [previewQuery, setPreviewQuery] = useState<PreviewQuery | null>(null);

  return (
    <Styled.OverviewTable data-testid="overview-table">
      <Header columns={tableColumns} addReceipt={addReceipt} />
      <RowsMemo
        isMobile={isMobile}
        columns={tableColumns}
        rows={rows}
        setPreviewQuery={setPreviewQuery}
      />
      {!isMobile && <OverviewPreview query={previewQuery} />}
    </Styled.OverviewTable>
  );
};
