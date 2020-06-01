import styled from 'styled-components';

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
