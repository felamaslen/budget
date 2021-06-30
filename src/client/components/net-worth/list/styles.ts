import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { asButton } from '~client/styled/shared/role';
import { colors, breakpoints } from '~client/styled/variables';

export const NetWorthList = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  min-height: 0;
  overflow: auto;

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${rem(480)};
    min-height: initial;
    overflow: hidden;
  }
`;

export type ItemSummaryProps = { add?: boolean };

const itemSummaryStyles = ({ add }: ItemSummaryProps): SerializedStyles => css`
  background: ${colors.translucent.light.light};
  display: flex;
  flex-flow: column;
  padding: 0 ${rem(6)};
  align-items: center;
  justify-content: center;
  margin: ${rem(2)} ${rem(4)};
  position: relative;
  cursor: pointer;
  border-radius: 2px;
  outline: none;

  ${!!add &&
  css`
    margin: ${rem(4)} auto;
    padding: ${rem(4)} ${rem(8)};
    width: auto;
  `};

  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.light.mediumLight};
    margin: 0;
    user-select: none;

    &:focus,
    &:hover {
      background: ${colors.light.mediumDark};
    }
    &:active {
      box-shadow: 0 1px 3px ${colors.shadow.dark};
    }

    ${add
      ? css`
          margin: 0 auto ${rem(4)};
          padding: 0;
          width: ${rem(160)};
          grid-row: 2;
          flex: 0 0 ${rem(32)};
          line-height: ${rem(32)};
        `
      : css`
          &:last-child {
            grid-row: 6;
            grid-column: 3;
            z-index: 3;
          }
        `};
  }
`;

export const ItemSummary = asButton(styled.div<ItemSummaryProps>(itemSummaryStyles));
