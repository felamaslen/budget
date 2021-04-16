import { css, SerializedStyles } from '@emotion/react';
import { rem } from 'polished';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import DotLoader from 'react-spinners/DotLoader';

import * as Styled from './styles';

import { useCTA } from '~client/hooks';
import { colors } from '~client/styled/variables';

export type Props = { loading: boolean; setSettingsOpen: Dispatch<SetStateAction<boolean>> };

const spinnerOverride = (loading: boolean): SerializedStyles => css`
  flex: 0 0 ${rem(22)};
  opacity: ${loading ? 1 : 0};
  position: absolute;
  right: 0;
  transition: opacity 0.5s ease;
`;

export const AppLogo: React.FC<Props> = ({ loading, setSettingsOpen }) => {
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

  const openSettingsDialog = useCallback(() => setSettingsOpen(true), [setSettingsOpen]);
  const logoEvents = useCTA(openSettingsDialog);

  return (
    <Styled.AppLogo>
      <Styled.Loader>
        <DotLoader
          loading={loading || showLoading}
          color={colors.amber}
          css={spinnerOverride(loading)}
          size={22}
        />
      </Styled.Loader>
      <Styled.Logo>
        <Styled.TitleContainer>
          <Styled.Title>
            <span>Budget</span>
          </Styled.Title>
          <Styled.SettingsButton {...logoEvents}>⚙</Styled.SettingsButton>
        </Styled.TitleContainer>
      </Styled.Logo>
    </Styled.AppLogo>
  );
};
