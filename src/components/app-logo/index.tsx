import React, { SFC } from 'react';

import * as Styled from './styles';

interface AppLogoProps {
  loading?: boolean;
  unsaved?: boolean;
}

const AppLogo: SFC<AppLogoProps> = ({ loading, unsaved }) => (
  <Styled.AppLogo>
    {unsaved && <Styled.QueueNotSaved>Unsaved changes!</Styled.QueueNotSaved>}
    <Styled.Logo>
      <span>Budget</span>
      {loading && <Styled.LoadingApi />}
    </Styled.Logo>
  </Styled.AppLogo>
);

export default AppLogo;
