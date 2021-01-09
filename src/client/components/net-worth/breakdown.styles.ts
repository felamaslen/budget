import { css, SerializedStyles } from '@emotion/react';
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
  background: ${colors.shadow.dark};
  color: ${colors.white};
  flex: 0 0 auto;
  width: 100%;

  ${Button} {
    align-items: center;
    background: none;
    border: none;
    display: inline-flex;
    flex: 0 0 ${rem(22)};
    height: ${rem(22)};
    justify-content: center;
    padding: 0;
    width: ${rem(22)};

    ${breakpoint(breakpoints.mobile)} {
      margin: 0 ${rem(4)};
    }
  }
`;

const arrowColor = colors.light.mediumLight;

const NavButton = styled.div`
  border: solid transparent;
  border-width: ${rem(6)} ${rem(10)};
`;

export const NavBack = styled(NavButton)`
  border-right-color: ${arrowColor};
`;

export const NavExit = styled(NavButton)`
  border-bottom-color: ${arrowColor};
  border-width: 0 ${rem(6)} ${rem(11)} ${rem(6)};
  width: ${rem(12)};
`;

export const NavNext = styled(NavButton)`
  border-left-color: ${arrowColor};
`;

export const Title = styled.h3`
  flex: 1;
  font-size: ${rem(14)};
  margin: 0;
  text-align: center;
`;

export type LabelBaseProps = { level: 0 | 1 | 2 };

function labelLevelStyles(level: LabelBaseProps['level']): SerializedStyles {
  switch (level) {
    case 2:
      return css`
        color: ${colors.dark.light};
      `;
    case 1:
      return css`
        font-size: ${rem(14)};
      `;
    case 0:
    default:
      return css`
        font-size: ${rem(16)};
        font-weight: bold;
        z-index: 3;
      `;
  }
}

export const Label = styled(LabelBase)<LabelBaseProps>(
  ({ level = 0 }) => css`
    color: ${colors.black};
    font-size: ${rem(11)};
    left: 0;
    line-height: ${rem(16)};
    top: 0;
    transform: none;
    width: 100%;

    ${labelLevelStyles(level)}
  `,
);
