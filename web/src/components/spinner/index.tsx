import React from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './styles';
import { getInitialLoading, getAnalysisLoading } from '~client/selectors';

export const Spinner: React.FC = () => {
  const initialLoading = useSelector(getInitialLoading);
  const analysisLoading = useSelector(getAnalysisLoading);
  if (!initialLoading && !analysisLoading) {
    return null;
  }

  return (
    <Styled.Outer initialLoading={initialLoading}>
      <Styled.Inner>
        <Styled.Progress offset={15} />
        <Styled.Progress offset={105} />
      </Styled.Inner>
    </Styled.Outer>
  );
};
