import styled from '@emotion/styled';
import { rem } from 'polished';
import { colors } from '~client/styled/variables';

export const RateSetter = styled.div`
  background: ${colors.translucent.light.dark};
  cursor: col-resize;
  display: flex;
  flex-flow: column;
  margin: ${rem(2)} 0 0 0;
  padding: 0 ${rem(4)};
  position: relative;
  width: 100%;

  input {
    flex: 1;
  }
`;

export const RateSetterMetadata = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 ${rem(24)};
  font-size: ${rem(12)};
  justify-content: space-between;
  white-space: nowrap;
`;

export const RateTitle = styled.span`
  font-weight: bold;
`;

export const RateValue = styled.span`
  font-style: italic;
  margin-left: ${rem(2)};
`;
