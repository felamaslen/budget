import styled from 'styled-components';

export const FundValue = styled.span`
  display: flex;
  margin-left: 10px;
  flex: 0 0 auto;
  font-size: 90%;
`;

const Part = styled.span`
  margin-right: 4px;
`;

export const Cost = styled(Part)`
  flex: 0 0 auto;
  text-align: right;
`;
export const Value = styled(Part)`
  width: 50px;
  flex: 0 0 auto;
  font-weight: bold;
  text-align: center;
`;
