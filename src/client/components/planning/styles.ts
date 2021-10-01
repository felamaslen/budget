import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import type { AccountTransaction } from './types';

import { FormField } from '~client/components/form-field/styles';
import { breakpoint } from '~client/styled/mixins';
import {
  Button as ButtonShared,
  ButtonAdd,
  ButtonDelete,
  Flex,
  FlexColumn,
} from '~client/styled/shared';
import { H3 } from '~client/styled/shared/typography';
import { breakpoints, colors } from '~client/styled/variables';

const borderColor = colors.light.mediumDark;
const widthDate = 76;
const lineHeight = 22;
const monthGroupItemWidth = 104;
const monthGroupValueWidth = 84;

export const scrollBarWidth = 8;

export const Button = styled(ButtonShared)`
  ${breakpoint(breakpoints.mobile)} {
    align-items: center;
    display: inline-flex;
    height: ${rem(lineHeight - 4)};
    padding: 0 ${rem(4)};
  }
`;

export const PlanningWrapper = styled(FlexColumn)`
  width: 100%;
`;

export const Planning = styled(Flex)`
  background: ${colors.white};
  overflow: hidden;
  min-height: 0;
  width: 100%;
`;

export const Sidebar = styled(FlexColumn)`
  flex: 0 0 ${rem(180)};
  overflow-x: hidden;
  min-height: 0;
`;

export const SidebarTitle = styled(H3)`
  cursor: pointer;
`;

export const SidebarToggleStatus = styled.span`
  font-family: monospace;
`;

export const SidebarSection = styled(FlexColumn)`
  border-bottom: 1px solid ${colors.light.mediumDark};
  font-size: ${rem(12)};
  margin-bottom: ${rem(8)};
  padding-bottom: ${rem(8)};
`;

export const Table = styled.div`
  display: grid;
  flex: 1;
  font-size: ${rem(13)};
  grid-template-columns: ${rem(lineHeight)} auto;
  grid-template-rows: 100%;
  min-width: 0;
`;

export const MonthHeaders = styled(FlexColumn)`
  grid-column: 1;
  overflow: auto;
  padding-bottom: ${rem(scrollBarWidth)};
  ::-webkit-scrollbar {
    width: 0;
  }
`;

export const TableWithoutLeftHeader = styled.div`
  display: grid;
  grid-column: 2;
  grid-row: 1;
  grid-template-columns: auto;
  grid-template-rows: ${rem(lineHeight)} auto;
  min-width: 0;
`;

export const TableScrollArea = styled.div`
  overflow: auto;
  height: 100%;
  min-height: 0;
  min-width: 0;
  width: 100%;
  ::-webkit-scrollbar {
    height: ${rem(scrollBarWidth)};
    width: ${rem(scrollBarWidth)};
  }
`;

export const Header = styled(Flex)`
  align-items: center;
  border-bottom: 3px solid ${borderColor};
  font-weight: bold;
  grid-row: 1;
  height: ${rem(lineHeight)};
  overflow-x: auto;
  overflow-y: hidden;
  ::-webkit-scrollbar {
    height: 0;
  }
`;

export const MonthGroups = styled(FlexColumn)``;

export const MonthGroup = styled(FlexColumn)``;

export const MonthHeader = styled.div<{
  numRows: number;
  isCurrentMonth?: boolean;
}>(
  ({ numRows, isCurrentMonth = false }) => css`
    align-items: center;
    background-color: ${isCurrentMonth ? colors.highlight.dark : colors.light.light};
    border-right: 3px solid ${borderColor};
    border-bottom: 1px solid ${borderColor};
    display: inline-flex;
    flex: 0 0 ${rem(lineHeight * numRows)};
    grid-column: 1;
    height: 100%;
    justify-content: center;
    white-space: nowrap;
  `,
);

export const MonthHeaderText = styled.span`
  display: inline-flex;
  font-weight: bold;
  justify-content: center;
  overflow: visible;
  transform: rotate(-90deg);
  width: 0;
`;

export const Row = styled(Flex)`
  align-items: center;
  height: ${rem(lineHeight)};
`;

export const MonthEnd = styled(Row)`
  font-weight: bold;
  width: 100%;
`;

export const Cell = styled.div`
  align-items: center;
  border-bottom: 1px solid ${borderColor};
  border-right: 1px solid ${borderColor};
  display: inline-flex;
  height: ${rem(lineHeight)};
  padding: 0 ${rem(2)};

  ${MonthEnd} & {
    background: ${colors.light.mediumLight};
  }
`;

export const CellNumeric = styled(Cell)`
  justify-content: flex-end;
`;

export const MonthHeadersPadding = styled(Cell)`
  border-bottom: 3px solid ${borderColor};
  flex: 0 0 ${rem(lineHeight)};
`;

export const MonthDateColumn = styled(FlexColumn)`
  flex: 0 0 ${rem(widthDate)};
`;

export const MonthDate = styled(Cell)`
  flex: 0 0 ${rem(widthDate)};
`;

export const MonthDateHeader = styled(Cell)`
  flex: 0 0 ${rem(widthDate)};
  width: ${rem(widthDate)};
`;

export const AccountGroup = styled.div<Pick<AccountTransaction, 'isVerified'>>(
  ({ isVerified = false }) => css`
    font-weight: ${isVerified ? 'bold' : 'normal'};
    display: grid;
    grid-template-columns: ${rem(monthGroupItemWidth)} ${rem(monthGroupValueWidth)};

    input[type='text'] {
      width: 100%;
    }
  `,
);

export const AccountGroupWrapper = styled(FlexColumn)`
  flex: 0 0 ${rem(monthGroupItemWidth + monthGroupValueWidth)};
  font-size: ${rem(10)};

  ${ButtonAdd}, ${ButtonDelete} {
    flex: 0 0 auto;
  }
`;

export const AccountsInMonth = styled(Flex)``;

export const AccountGroupHeader = styled(Cell)`
  flex: 0 0 ${rem(monthGroupItemWidth + monthGroupValueWidth)};
  position: relative;
  width: ${rem(monthGroupItemWidth + monthGroupValueWidth)};

  & > span {
    flex: 1;
  }

  input[type='text'] {
    width: ${rem(monthGroupValueWidth)};
  }
`;

export const AccountEditForm = styled(FlexColumn)`
  background: ${colors.translucent.light.light};
  border: 1px solid ${borderColor};
  border-top: none;
  left: 0;
  max-height: ${rem(360)};
  min-height: ${rem(96)};
  overflow-y: auto;
  position: absolute;
  top: ${rem(lineHeight)};
  width: ${rem(220)};
  z-index: 5;

  & > div {
    width: 100%;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    min-width: 0;
    width: 100%;
  }

  ${FormField} {
    display: flex;
    flex: 1;
    min-width: 0;
  }
  input {
    min-width: 0;
  }
`;

export const AccountEditFormLabel = styled.span`
  flex: 0 0 ${rem(64)};
`;

export const AccountEditFormSection = styled(FlexColumn)`
  border-bottom: 1px solid ${borderColor};
  margin: 0 0 ${rem(4)} 0;
  padding: ${rem(2)} 0;
`;

export const AccountGroupItem = styled(Cell)`
  grid-column: 1;
`;

export const AccountGroupItemText = styled.span`
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const AccountGroupValue = styled(CellNumeric)`
  grid-column: 2;
`;

export const RatesForm = styled(FlexColumn)``;

export const RatesLabel = styled.div`
  flex: 1;
`;

export const RatesValue = styled(Flex)`
  flex: 1;
  input {
    width: ${rem(64)};
  }
`;

export const ThresholdsValue = styled(RatesValue)`
  input {
    width: ${rem(96)};
  }
`;
