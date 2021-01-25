import styled from '@emotion/styled';
import { rem } from 'polished';
import { colors } from '~client/styled/variables';

export const width = 204;
export const height = 104;

export const Preview = styled.div`
  background: ${colors.translucent.light.mediumLight};
  box-shadow: 0 2px 6px ${colors.shadow.dark};
  font-weight: normal;
  height: ${rem(height)};
  left: 0;
  opacity: 0.8;
  position: absolute;
  top: 100%;
  width: ${rem(width)};
  z-index: 2;
`;
