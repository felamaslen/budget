import React from 'react';
import * as Styled from './styles';

type Props = { loading: boolean };

export const AppLogo: React.FC<Props> = ({ loading }) => (
  <Styled.AppLogo>
    <Styled.Logo>
      <span>{'Budget'}</span>
      {loading && <Styled.LoadingApi />}
    </Styled.Logo>
  </Styled.AppLogo>
);
