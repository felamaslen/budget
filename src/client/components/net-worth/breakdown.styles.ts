import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem, rgba } from 'polished';

import { InfiniteChild } from '~client/components/block-packer/styles';
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

  ${InfiniteChild} {
    background-image: none;
    border-right: 1px solid ${rgba(colors.light.light, 0.4)};
    border-bottom: 1px solid ${rgba(colors.light.light, 0.4)};
    box-shadow: none;
    overflow: hidden;
    padding-top: ${rem(16)};

    &::after {
      box-sizing: content-box;
      margin-top: ${rem(-16)};
      padding-bottom: ${rem(16)};
    }
  }
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
