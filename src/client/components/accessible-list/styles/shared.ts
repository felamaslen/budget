import styled from '@emotion/styled';
import { rem } from 'polished';

import { fieldSizes, rowHeightDesktop, rowHeightMobile } from './constants';
import { fieldSizesMobile } from './mobile';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const borderColor = colors.light.mediumDark;
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

export const ListWithoutMargin = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
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

export const Row = styled.li<{ odd?: boolean }>`
  display: flex;
  height: ${rem(rowHeightMobile)};

  ${breakpoint(breakpoints.mobile)} {
    background-color: ${({ odd }): string => (odd ? colors.white : colors.light.mediumLight)};
    border-right: 1px solid ${borderColor};
    height: ${rem(rowHeightDesktop)};

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

export const CreateRow = styled(Row)`
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
