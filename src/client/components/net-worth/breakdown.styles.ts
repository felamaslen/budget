import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { Label as LabelBase } from '~client/components/fund-weights/styles';
import { breakpoint } from '~client/styled/mixins';
import { Button, Flex, FlexColumn } from '~client/styled/shared';
import { breakpoints, colors } from '~client/styled/variables';

export const BreakdownContainer = styled(FlexColumn)`
  background: ${colors.white};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
`;

export const TitleContainer = styled(Flex)`
  align-items: center;
  flex: 0 0 auto;
  width: 100%;

  ${Button} {
    align-items: center;
    display: inline-flex;
    flex: 1 1 0;
    height: ${rem(22)};
    padding: 0;

    ${breakpoint(breakpoints.mobile)} {
      flex: 0 0 ${rem(100)};
      height: ${rem(18)};
      margin: 0 ${rem(4)};
    }
  }
`;

export const Title = styled.h3`
  flex: 1;
  font-size: ${rem(14)};
  margin: 0;
  text-align: center;
`;

export const Label = styled(LabelBase)<{ subBlock?: boolean }>(
  ({ subBlock }) => css`
    color: ${subBlock ? colors.shadow.dark : colors.white};
    font-size: ${rem(subBlock ? 12 : 22)};
    font-weight: ${subBlock ? 'light' : 'bold'};
  `,
);
