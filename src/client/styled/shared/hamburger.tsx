import styled from '@emotion/styled';
import { rem } from 'polished';

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

export const HamburgerButton = styled.button`
  align-items: center;
  appearance: none;
  background: ${colors.translucent.light.dark};
  border: none;
  cursor: pointer;
  display: flex;
  flex-flow: column;
  justify-content: center;
  height: ${rem(24)};
  outline: none;
  padding: 0;
  width: ${rem(24)};
`;
