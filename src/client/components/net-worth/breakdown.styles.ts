import styled from '@emotion/styled';
import { FlexColumn } from '~client/styled/shared';
import { colors } from '~client/styled/variables';

export const BreakdownContainer = styled(FlexColumn)`
  background: ${colors.white};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const TitleContainer = styled.div`
  flex: 0 0 auto;
`;

export const Title = styled.h3`
  margin: 0;
  text-align: center;
`;
