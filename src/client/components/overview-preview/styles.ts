import styled from '@emotion/styled';
import { rem } from 'polished';
import { colors } from '~client/styled/variables';

export const width = 320;
export const height = 200;

export const Preview = styled.div`
  box-shadow: 0 2px 6px ${colors.shadow.dark};
  height: ${rem(height)};
  opacity: 0.8;
  position: fixed;
  width: ${rem(width)};
`;

export const ImageContainer = styled.div`
  background: ${colors.white};

  &,
  img {
    height: 100%;
    width: 100%;
  }
`;
