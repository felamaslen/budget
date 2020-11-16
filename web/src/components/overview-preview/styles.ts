import styled from 'styled-components';
import { rem } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';

type Props = {
  left: number;
  top: number;
};

export const width = 320;
export const height = 200;

export const Preview = styled.div.attrs<Props>((props) => ({
  style: {
    left: props.left,
    top: props.top,
  },
}))<Props>`
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
