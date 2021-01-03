import styled from '@emotion/styled';

import { colors, sizes } from '~client/styled/variables';

export const Outer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.translucent.light.mediumLight};
  height: 100%;
  left: 0;
  position: fixed;
  top: ${sizes.navbarHeight}px;
  width: 100%;
  z-index: 500;
`;
