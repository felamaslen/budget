import styled from 'styled-components';
import { rem } from '~client/styled/mixins';
import { colors } from '~client/styled/variables';

type Props = {
  left: number;
  top: number;
};

export const Preview = styled.div.attrs<Props>((props) => ({
  style: {
    left: props.left,
    top: props.top,
  },
}))<Props>`
  box-shadow: 0 2px 6px ${colors.shadow.dark};
  height: ${rem(200)};
  position: fixed;
  width: ${rem(320)};
`;
