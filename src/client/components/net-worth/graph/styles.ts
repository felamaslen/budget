import styled from '@emotion/styled';
import { darken, rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { H3, H4 } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';

export const keyColors = {
  assets: darken(0.5)(colors.netWorth.assets),
  liabilities: darken(0.5)(colors.netWorth.liabilities),
  expenses: darken(0.2)(colors.netWorth.expenses),
  options: colors.netWorth.options,
};

export const GraphSection = styled.div`
  display: flex;
  flex: 0 0 50%;
  flex-flow: column;
  max-width: 50%;
  overflow: hidden;

  &:not(last-child) {
    border-right: 1px solid ${colors.medium.mediumDark};
  }

  ${breakpoint(breakpoints.mobile)} {
    display: block;
    flex: 1;
    max-width: initial;

    &:not(last-child) {
      border-right: none;
    }
  }
`;

export const FTILabel = styled(H3)`
  align-items: center;
  display: inline-flex;
  font-size: ${rem(14)};
  margin: 0;

  ${breakpoint(breakpoints.mobile)} {
    margin: ${rem(8)} 0 0 0;
    font-size: ${rem(16)};
  }
`;

export const FTIEquals = styled.span`
  margin: 0 0.75rem;
`;

export const FTIFormula = styled.div`
  display: flex;
  align-items: center;
  font-family: serif;
`;

export const FTIFraction = styled.span`
  display: flex;
  flex-flow: column;
  align-items: center;
`;

export const FTIFormulaNumerator = styled.span`
  border-bottom: 1px solid black;
`;

export const FTIFormulaDenominator = styled.span``;

export const GraphKey = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 ${rem(48)};
  font-size: ${rem(10)};

  ${breakpoint(breakpoints.mobile)} {
    font-size: ${rem(16)};
  }

  ${H4},
  ul {
    margin: 0;
    padding: 0;
  }
`;

const Key = styled.li`
  font-weight: bold;
  list-style: none;
  margin-left: ${rem(4)};
  white-space: nowrap;
`;

export const KeyAssets = styled(Key)`
  color: ${keyColors.assets};
`;
export const KeyOptions = styled.span`
  color: ${keyColors.options};
  font-weight: normal;
`;
export const KeyLiabilities = styled(Key)`
  color: ${keyColors.liabilities};
`;
export const KeyExpenses = styled(Key)`
  color: ${keyColors.expenses};
`;
