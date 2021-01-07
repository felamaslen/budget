import { css, SerializedStyles } from '@emotion/react';
import { rem } from 'polished';
import React, { useEffect, useRef, useState } from 'react';
import DotLoader from 'react-spinners/DotLoader';

import * as Styled from './styles';
import { colors } from '~client/styled/variables';

type Props = { loading: boolean };

const spinnerOverride = (loading: boolean): SerializedStyles => css`
  flex: 0 0 auto;
  margin-left: ${rem(8)};
  opacity: ${loading ? 1 : 0};
  position: absolute;
  right: 0;
  transition: opacity 0.5s ease;
`;

export const AppLogo: React.FC<Props> = ({ loading }) => {
  const [showLoading, setShowLoading] = useState<boolean>(loading);
  const timer = useRef<number>(0);
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    } else {
      timer.current = window.setTimeout(() => setShowLoading(false), 500);
    }
    return (): void => clearTimeout(timer.current);
  }, [loading]);

  return (
    <Styled.AppLogo>
      <Styled.Logo>
        <Styled.TitleContainer>
          <Styled.Title>Budget</Styled.Title>
          <DotLoader
            loading={loading || showLoading}
            color={colors.amber}
            css={spinnerOverride(loading)}
            size={22}
          />
        </Styled.TitleContainer>
      </Styled.Logo>
    </Styled.AppLogo>
  );
};
