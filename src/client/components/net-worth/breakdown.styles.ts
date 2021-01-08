import styled from '@emotion/styled';
import { rem } from 'polished';

import { Flex, FlexColumn } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const BreakdownContainer = styled(FlexColumn)`
  background: ${colors.white};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const TitleContainer = styled(Flex)`
  flex: 0 0 auto;
  width: 100%;
`;

export const Title = styled.h3`
  flex: 1;
  font-size: ${rem(14)};
  margin: 0;
  text-align: center;
`;
