import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';

import { Flex, FlexColumn } from '~client/styled/shared';
import { H4 } from '~client/styled/shared/typography';
import { breakpoints, colors } from '~client/styled/variables';

export const graphHeight = 450;
export const graphHeightMobile = 240;

export const LoanView = styled(Flex)`
  background: ${colors.white};
  flex: 1;
  flex-flow: column;
  min-height: 0;

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    flex-flow: row;
    height: ${rem(graphHeight)};
    width: ${rem(800)};
  }
`;

export const LoansGraph = styled.div`
  flex: 0 0 ${rem(graphHeightMobile)};
  position: relative;

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
  }
`;

export const LoansSidebar = styled(FlexColumn)`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 0 ${rem(8)};
`;

export const LoansSidebarItem = styled(FlexColumn)`
  font-size: ${rem(14)};
`;

export const LoansSidebarTitle = styled(H4)<{ color?: string }>(
  ({ color = colors.black }) => css`
    align-items: center;
    color: ${color};
    cursor: pointer;
    display: inline-flex;
    font-size: ${rem(16)};
    margin: ${rem(4)} 0 ${rem(8)} 0;
    padding: 0 ${rem(4)};
  `,
);

export const LoanInfo = styled(FlexColumn)`
  padding-left: ${rem(14)};

  input[type='range'],
  input[type='number'] {
    width: ${rem(100)};
  }
`;

export const LoanInfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto ${rem(100)} ${rem(80)};
`;

export const LoanInfoGridRow = styled.div``;

export const LoanInfoLabel = styled.span`
  grid-column: 1;
`;

export const LoanInfoInput = styled.div`
  grid-column: 2;
`;

export const LoanInfoValues = styled.span`
  grid-column: 3;
  padding: 0 ${rem(8)};

  input[type='range'] {
    max-width: 100%;
  }
`;
