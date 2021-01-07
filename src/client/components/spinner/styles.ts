import styled from '@emotion/styled';

import { colors, sizes } from '~client/styled/variables';

export const Outer = styled.div`
  align-items: center;
  background: ${colors.translucent.light.mediumLight};
  display: flex;
  flex-flow: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: ${sizes.navbarHeight}px;
  width: 100%;
  z-index: 500;
`;
