import React from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './styles';
import { getInitialLoading } from '~client/selectors';

export const Spinner: React.FC = () => {
  const active = useSelector(getInitialLoading);
  if (!active) {
    return null;
  }

  return (
    <Styled.Outer>
      <Styled.Inner>
        <Styled.Progress offset={15} />
        <Styled.Progress offset={105} />
      </Styled.Inner>
    </Styled.Outer>
  );
};
