import styled from 'styled-components';

export const Flex = styled.div`
  display: flex;
`;

export const FlexCenter = styled(Flex)`
  align-items: center;
  justify-content: center;
`;

export const RowSingleLine = styled(Flex)`
  flex-flow: row nowrap;
`;
