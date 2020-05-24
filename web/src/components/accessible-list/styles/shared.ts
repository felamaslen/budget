import styled from 'styled-components';

import { fieldSizes } from './constants';
import { fieldSizesMobile } from './mobile';
import { breakpoint, rem } from '~client/styled/mixins';
import { ListWithoutMargin } from '~client/styled/shared/layout';
import { colors, breakpoints } from '~client/styled/variables';

export const borderColor = colors['slightly-light'];
const focusColor = colors.blue;

export const Base = styled.div<{ color?: string }>`
  background-color: ${({ color }): string => color ?? colors.white};
  display: flex;
  flex-flow: column;
  flex: 1 1 0;
  min-height: 0;

  ${breakpoint(breakpoints.mobile)} {
    background-color: ${colors.white};
  }
`;

export const HeaderColumn = styled.div<{
  column?: string;
}>`
  flex: ${({ column }): number => (column && Reflect.get(fieldSizesMobile, column)) ?? 1};
  font-weight: bold;
  height: ${rem(28)};
  line-height: ${rem(28)};
  padding: 0 ${rem(4)};
  text-align: center;
  white-space: nowrap;

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${({ column = '' }): string => rem(fieldSizes[column] ?? fieldSizes.default)};
    border-right: 1px solid ${borderColor};
    height: ${rem(24)};
    line-height: ${rem(24)};
    text-align: left;
  }
`;

export const List = styled(ListWithoutMargin)`
  flex: 1 1 0;
  margin: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 0 ${rem(48)} 0;

  ${breakpoint(breakpoints.mobile)} {
    padding-bottom: 0;
  }
`;

export const Row = styled.li`
  display: flex;
  height: ${rem(30)};

  ${breakpoint(breakpoints.mobile)} {
    border-right: 1px solid ${borderColor};
    height: ${rem(24)};

    &:nth-child(2n) {
      background-color: ${colors.light};
    }

    input[type='text'] {
      background-color: transparent;
      border: none;
      border-right: 1px solid ${borderColor};
      height: ${rem(24)};
      margin: 0;
      outline: none;
      padding: 0 ${rem(2)};
      width: 0;
      flex: 1;

      &:focus {
        box-shadow: inset 0 0 1px 1px ${focusColor};
      }
    }
  }
`;

export const CreateRow = styled(Row).attrs({
  as: 'div',
})`
  display: none;

  ${breakpoint(breakpoints.mobile)} {
    background-color: ${colors.white} !important;
    border-top: 1px solid ${borderColor};
    border-bottom: 1px solid ${borderColor};
    display: flex;
    flex: 0 0 auto;
  }
`;

export const CreateField = styled.div`
  position: relative;
`;
