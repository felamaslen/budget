import styled from '@emotion/styled';
import { rem } from 'polished';

import { ButtonUnStyled } from './reset';

import { colors } from '~client/styled/variables';

export const Hamburger = styled.span`
  &,
  &::before,
  &::after {
    background: ${colors.black};
    height: ${rem(2)};
    width: ${rem(16)};
  }

  &::before,
  &::after {
    content: '';
    display: block;
  }

  &::before {
    margin-top: ${rem(-6)};
  }

  &::after {
    margin-top: ${rem(10)};
  }
`;

export const HamburgerButton = styled(ButtonUnStyled)`
  align-items: center;
  background: ${colors.translucent.light.dark};
  cursor: pointer;
  display: flex;
  flex-flow: column;
  justify-content: center;
  height: ${rem(24)};
  padding: 0;
  width: ${rem(24)};
`;
