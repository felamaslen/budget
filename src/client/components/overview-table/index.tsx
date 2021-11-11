import { memo } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { OverviewTableCells as Cells } from './cells';
import * as Styled from './styles';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { useMediaQuery, useToday } from '~client/hooks';
import { getOverviewTable } from '~client/selectors';
import { breakpointBase } from '~client/styled/mixins';
import { breakpoints } from '~client/styled/variables';
import type {
  OverviewHeader,
  OverviewTable as OverviewTableRows,
  OverviewTableColumn,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';

type ColumnsProps = { columns: OverviewTableColumn[] };

const columnsMobile: OverviewHeader[] = [PageListStandard.Income, 'spending', 'netWorth'];

const columnsRestricted: OverviewHeader[] = [
  PageListStandard.Income,
  'spending',
  'net',
  'netWorth',
];

const columnsFull: OverviewHeader[] = [
  'stocks',
  PageListStandard.Bills,
  PageListStandard.Food,
  PageListStandard.General,
  PageListStandard.Holiday,
  PageListStandard.Social,
  PageListStandard.Income,
  'spending',
  'net',
  'netWorth',
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
      <Styled.HeaderLinkButton onClick={addReceipt}>
        <Styled.AddReceiptButton />
      </Styled.HeaderLinkButton>
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
};

const Rows: React.FC<PropsRows> = ({ isMobile, columns, rows }) => (
  <Styled.Rows>
    {rows.slice(isMobile ? -19 : 0).map((row) => (
      <Cells key={row.monthText} columns={columns} row={row} />
    ))}
  </Styled.Rows>
);
const RowsMemo = memo(Rows);

export const OverviewTable: React.FC<Props> = ({ addReceipt }) => {
  const today = useToday();
  const rows = useSelector(getOverviewTable(today));

  const isTablet = useMediaQuery(breakpointBase(breakpoints.mobile));
  const isLargeTablet = useMediaQuery(breakpointBase(breakpoints.tabletSmall));
  const isDesktop = useMediaQuery(breakpointBase(breakpoints.tablet));
  const isLargeDesktop = useMediaQuery(breakpointBase(breakpoints.desktop));

  const isMobile = !isTablet;
  const isLarge = (!isDesktop && isLargeTablet) || isLargeDesktop;

  const tableColumns = getTableColumns(isMobile, isLarge);

  return (
    <Styled.OverviewTable data-testid="overview-table">
      <Header columns={tableColumns} addReceipt={addReceipt} />
      <RowsMemo isMobile={isMobile} columns={tableColumns} rows={rows} />
    </Styled.OverviewTable>
  );
};
