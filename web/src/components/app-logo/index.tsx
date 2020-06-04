import React from 'react';
import * as Styled from './styles';

type Props = { loading: boolean; unsaved: boolean };

export const AppLogo: React.FC<Props> = ({ loading, unsaved }) => (
  <Styled.AppLogo>
    {unsaved && <Styled.QueueNotSaved>{'Unsaved changes!'}</Styled.QueueNotSaved>}
    <Styled.Logo>
      <span>{'Budget'}</span>
      {loading && <Styled.LoadingApi />}
    </Styled.Logo>
  </Styled.AppLogo>
);
