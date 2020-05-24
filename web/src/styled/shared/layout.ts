import styled from 'styled-components';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints } from '~client/styled/variables';

export const MobileOnly = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    display: none;
  }
`;

type DisplayType = 'block' | 'none';

export const DesktopOnly = styled.div<{
  displayType?: DisplayType;
}>`
  display: none;
  ${breakpoint(breakpoints.mobile)} {
    display: ${({ displayType = 'block' }): DisplayType => displayType};
  }
`;

export const InlineFlex = styled.span`
  display: inline-flex;
`;

export const Flex = styled.div`
  display: flex;
`;

export const FlexCenter = styled(Flex)`
  align-items: center;
`;

export const FlexColumn = styled(Flex)`
  flex-flow: column;
`;

export const InlineFlexCenter = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const ListWithoutMargin = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;
