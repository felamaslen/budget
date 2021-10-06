import { css, SerializedStyles } from '@emotion/react';
import { rem } from 'polished';
import React from 'react';
import { Link } from 'react-router-dom';
import DotLoader from 'react-spinners/DotLoader';

import { usePlanningContext } from '../context';
import { useYearOptions } from '../hooks/years';

import * as Styled from './styles';

const spinnerOverride = (showSpinner = false): SerializedStyles => css`
  position: absolute;
  margin: ${rem(4)};
  right: 0;
  visibility: ${showSpinner ? 'visible' : 'hidden'};
`;

export const Status: React.FC = () => {
  const { year, isSynced, isLoading, error } = usePlanningContext();
  const showSpinner = !isSynced || isLoading;

  const yearOptions = useYearOptions();

  return (
    <Styled.StatusBar>
      <Styled.YearButtons>
        {yearOptions.map((financialYear) => (
          <Styled.YearButton key={financialYear} isActive={financialYear === year}>
            <Link to={`/planning/${financialYear}`}>
              FY {financialYear - 2000}/{financialYear - 2000 + 1}
            </Link>
          </Styled.YearButton>
        ))}
      </Styled.YearButtons>
      {error ? <Styled.StatusError>{error}</Styled.StatusError> : null}
      {showSpinner && <DotLoader size={18} css={spinnerOverride(showSpinner)} />}
    </Styled.StatusBar>
  );
};
