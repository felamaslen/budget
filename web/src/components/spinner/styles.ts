import styled from '@emotion/styled';
import { FlexCenter } from '~client/styled/shared';

import { colors, sizes } from '~client/styled/variables';

export const Outer = styled(FlexCenter)`
  background: ${colors.translucent.light.mediumLight};
  flex-flow: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: ${sizes.navbarHeight}px;
  width: 100%;
  z-index: 500;
`;
